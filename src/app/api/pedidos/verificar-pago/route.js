// app/api/pedidos/verificar-pago/route.js

import { connectDB } from '../../../../lib/mongodb';
import Order from '../../../../models/Order';

function mapEstadoMP(status) {
  switch ((status || '').toLowerCase()) {
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
      return 'pendiente';
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get('payment_id');

  if (!paymentId) {
    return new Response(JSON.stringify({ error: 'Falta payment_id' }), { status: 400 });
  }

  try {
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Error fetching payment from MP:', res.status, text);
      return new Response(JSON.stringify({ error: 'Error consultando a MercadoPago' }), { status: res.status });
    }

    const paymentData = await res.json();
    const mpStatus = paymentData.status;
    const mappedStatus = mapEstadoMP(mpStatus);

    // Try to locate the order using external_reference first, then fallback to other fields
    const externalReference = paymentData.external_reference || paymentData.metadata?.external_reference || null;

    await connectDB();

    let order = null;
    if (externalReference) {
      order = await Order.findOne({ external_reference: externalReference });
    }

    // fallback: try finding by payment id stored in collectionId, paymentDetails.id or paymentId
    if (!order) {
      order = await Order.findOne({ $or: [ { 'paymentDetails.id': String(paymentData.id) }, { collectionId: String(paymentData.id) }, { paymentId: String(paymentData.id) } ] });
    }

    if (!order) {
      // If we can't find the order, just return payment data to the client — webhook may handle server-side update
      return new Response(JSON.stringify({ success: false, message: 'Orden no encontrada localmente', paymentData }), { status: 200 });
    }

    const estadoAnterior = order.estado;
    const newEstado = mappedStatus || estadoAnterior;

    // Update order fields (use atomic update to avoid full-document validation problems)
    const updatedOrder = await Order.findByIdAndUpdate(order._id, {
      $set: {
        estado: newEstado,
        paymentId: paymentData.id,
        pref_id: paymentData.preference_id || order.pref_id,
        collectionId: paymentData.collection_id || paymentData.id,
        collectionStatus: paymentData.status,
        paymentType: paymentData.payment_type_id,
        payerEmail: paymentData.payer?.email || order.payerEmail,
        metadata: {
          id: paymentData.id,
          status: (paymentData.status || '').toLowerCase(),
          status_detail: paymentData.status_detail,
          transaction_amount: paymentData.transaction_amount,
          date_approved: paymentData.date_approved,
          date_created: paymentData.date_created,
          payer: paymentData.payer,
        },
      }
    }, { new: true });

    // If it just became pagado, send emails (and mark pagoNotificado atomically)
    const pasaAPagado = estadoAnterior !== 'pagado' && newEstado === 'pagado';
    let adminSendResult = null;

    if (pasaAPagado && !order.pagoNotificado) {
      try {
        const { sendEmail } = await import('../../../../lib/mailer');
        const clienteEmail = order.usuarioInfo?.correo || '';
        const clienteNombre = order.usuarioInfo?.nombreCompleto || 'Cliente';
        const adminEmail = process.env.ADMIN_EMAIL || 'infostarlinksoluciones@gmail.com';
        const numeroPedido = order._id.toString();
        const montoTotal = order.total || 0;

        await sendEmail({ to: clienteEmail, subject: `Tu pedido #${numeroPedido} ahora est\u00e1: pagado`, html: `<p>Hola ${clienteNombre},</p><p>El estado de tu pedido #${numeroPedido} es: <strong>pagado</strong>.</p>` });

        const resAdmin = await sendEmail({ to: adminEmail, subject: `\ud83d\udd14 Pedido #${numeroPedido} en estado pagado`, html: `<p>Pedido #${numeroPedido} a nombre de ${clienteNombre} - estado: <strong>pagado</strong>. Monto: ${montoTotal}</p>` });
        adminSendResult = { success: true, info: resAdmin };

        await Order.updateOne({ _id: order._id }, { $set: { pagoNotificado: true } });
      } catch (e) {
        adminSendResult = { success: false, error: e?.message || String(e) };
        console.error('Error notificando en verificar-pago:', e);
      }
    }

    return new Response(JSON.stringify({ success: true, paymentData, updatedOrder, adminSendResult }), { status: 200 });
  } catch (error) {
    console.error('Error verificando pago:', error);
    return new Response(JSON.stringify({ error: 'Error interno', details: error?.message || String(error) }), { status: 500 });
  }
}
