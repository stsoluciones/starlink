// app/api/pedidos/webhook/route.js
import { connectDB } from '../../../../lib/mongodb';
import Order from '../../../../models/Order'; // Asegúrate que este modelo incluye 'external_reference'
import notificador from '../../../../Utils/notificador';

function mapEstadoMP(status) {
  switch (status) {
    case 'approved':
      return 'pagado';
    case 'pending':
    case 'in_process':
      return 'pendiente';
    case 'rejected':
    case 'cancelled':
    case 'refunded':
    case 'charged_back':
      return 'cancelado';
    default:
      return 'pendiente'; // O un estado como 'desconocido_mp'
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const topic = body.type;
    const paymentId = body.data?.id;

    if (topic !== 'payment' || !paymentId) {
      //console.log('Notificación no es de tipo "payment" o falta data.id.');
      // Devolver 200 para que MP no reintente notificaciones irrelevantes
      return new Response(JSON.stringify({ success: true, message: 'Notificación no procesada (no es de tipo payment o falta data.id)' }), { status: 200 });
    }

    // Consultar a MP para obtener detalles del pago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
    });

    if (!mpResponse.ok) {
      const errorData = await mpResponse.text();
      console.error(`❌ Error al obtener detalles del pago ${paymentId} de MP: ${mpResponse.status}`, errorData);
      return new Response(JSON.stringify({ error: 'Error al consultar API de MP' }), { status: mpResponse.status });
    }

    const payment = await mpResponse.json();
    //console.log("🔍 Datos del pago desde MP:", payment);

    const externalRefFromPayment = payment.external_reference;
    const mpPaymentStatus = payment.status;
    const mappedInternalStatus = mapEstadoMP(mpPaymentStatus);

    if (!externalRefFromPayment) {
      console.warn('⚠️ External Reference no encontrada en los datos del pago de MP. Payment ID:', paymentId, 'Datos del pago:', payment);
      // Es un problema si confías en external_reference. Decide cómo manejarlo.
      // Devolver 200 para que MP no reintente si el dato realmente falta en MP.
      return new Response(JSON.stringify({ success: true, message: 'External Reference faltante en datos de MP, notificación acusada.' }), { status: 200 });
    }

    await connectDB();

    // Buscar la orden usando external_reference
    const order = await Order.findOne({ external_reference: externalRefFromPayment });

    if (!order) {
      console.warn('⚠️ Orden no encontrada en DB para external_reference:', externalRefFromPayment, '. Payment ID de MP:', paymentId);
      // Devolver 200 para acusar recibo a MP, el problema es de sincronización de datos o un pedido no guardado.
      return new Response(JSON.stringify({ success: true, message: 'Orden no encontrada para la external_reference, notificación acusada.' }), { status: 200 });
    }

    //console.log(`🔄 Actualizando orden ${order._id} (ExtRef: ${externalRefFromPayment}) con estado de MP "${mpPaymentStatus}" a estado interno "${mappedInternalStatus}"`);

    const estadoAnterior = order.estado;
    const pasaAPagado = estadoAnterior !== 'pagado' && mappedInternalStatus === 'pagado';

    // Actualizar pedido
    order.estado = mappedInternalStatus;
    order.paymentId = payment.id; // El ID del pago actual
    order.pref_id = payment.preference_id; // Guardar también el preference_id si está disponible y es útil
    order.collectionId = payment.collection_id || payment.id;
    order.collectionStatus = payment.status; // El estado crudo de MP
    order.paymentType = payment.payment_type_id;
    // order.external_reference ya debería estar seteado, pero puedes re-asegurarlo si quieres
    // order.external_reference = externalRefFromPayment;
    order.siteId = payment.site_id;
    order.processingMode = payment.processing_mode;
    order.merchantAccountId = payment.merchant_account_id;
    order.payerEmail = payment.payer?.email;
    order.metadata = payment.metadata; // Metadata que enviaste originalmente
    order.paymentDetails = {
      status: payment.status,
      status_detail: payment.status_detail,
      payment_method_id: payment.payment_method_id,
      payment_type_id: payment.payment_type_id,
      installments: payment.installments,
      transaction_amount: payment.transaction_amount,
      date_approved: payment.date_approved,
      date_created: payment.date_created,
      last_updated: payment.last_modified || payment.date_last_updated,
    };

    // Usar findByIdAndUpdate para evitar revalidaciones inesperadas del documento completo
    await Order.findByIdAndUpdate(order._id, {
      $set: {
        estado: order.estado,
        paymentId: order.paymentId,
        pref_id: order.pref_id,
        collectionId: order.collectionId,
        collectionStatus: order.collectionStatus,
        paymentType: order.paymentType,
        siteId: order.siteId,
        processingMode: order.processingMode,
        merchantAccountId: order.merchantAccountId,
        payerEmail: order.payerEmail,
        metadata: order.metadata,
        paymentDetails: order.paymentDetails,
      }
    }, { new: true });

    //console.log(`✅ Pedido ${order._id} actualizado a estado: ${mappedInternalStatus}. Payment ID: ${payment.id}`);

    // Aquí podrías disparar otras acciones (ej: enviar email de confirmación si 'pagado')

    if (pasaAPagado && !order.pagoNotificado) {
      try {
        const clienteEmail = order.usuarioInfo?.correo || '';
        const clienteNombre = order.usuarioInfo?.nombreCompleto || 'Cliente';
        const adminEmail = process.env.ADMIN_EMAIL || 'infostarlinksoluciones@gmail.com';
        const numeroPedido = order._id.toString();
        const montoTotal = order.total || 0;

        // enviar emails
        const { sendEmail } = await import('../../../../lib/mailer');
        await sendEmail({ to: clienteEmail, subject: `Tu pedido #${numeroPedido} ahora está: pagado`, html: `<p>Hola ${clienteNombre},</p><p>El estado de tu pedido #${numeroPedido} es: <strong>pagado</strong>.</p>` });
        await sendEmail({ to: adminEmail, subject: `🔔 Pedido #${numeroPedido} en estado pagado`, html: `<p>Pedido #${numeroPedido} a nombre de ${clienteNombre} - estado: <strong>pagado</strong>. Monto: ${montoTotal}</p>` });

  // marcar pagoNotificado sin revalidar todo el documento
  await Order.updateOne({ _id: order._id }, { $set: { pagoNotificado: true } });
      } catch (e) {
        console.error('❌ Error ejecutando notificacion en webhook:', e);
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error('❌ Error fatal en webhook:', error);
    // Devolver 500 indica a MP que algo salió mal y podría reintentar.
    return new Response(JSON.stringify({ error: 'Error interno en webhook', details: error.message }), { status: 500 });
  }
}