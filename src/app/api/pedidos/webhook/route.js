// app/api/pedidos/webhook/route.js
import { connectDB } from '../../../../lib/mongodb';
import Order from '../../../../models/Order';

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
      return 'pendiente';
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('📥 Webhook recibido:', body);
    
    const topic = body.type;
    const paymentId = body.data?.id;

    if (topic !== 'payment' || !paymentId) {
      return new Response(JSON.stringify({ error: 'Not a payment notification' }), { status: 400 });
    }

    // Consultar a MP para obtener detalles del pago
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
    });

    const payment = await res.json();

    console.log("🔍 Datos del pago:", payment);

    // Validar pago aprobado
    const estadoMapped = mapEstadoMP(payment.status);
    if (!payment || !payment.metadata) {
      console.warn('❗️Metadata faltante en el pago');
      return new Response(JSON.stringify({ error: 'Metadata faltante en pago' }), { status: 400 });
    }

    // Conectar a DB
    await connectDB();

    const prefId = payment.metadata.pref_id || payment.preference_id;
    const order = await Order.findOne({ pref_id: prefId });

    if (!order) {
      console.warn('⚠️ Orden no encontrada para pref_id:', prefId);
      return new Response(JSON.stringify({ error: 'Orden no encontrada' }), { status: 404 });
    }

    // Actualizar pedido
    order.estado = estadoMapped;
    order.paymentId = payment.id;
    order.collectionId = payment.collection_id || payment.id;
    order.collectionStatus = payment.status;
    order.paymentType = payment.payment_type_id;
    order.preferenceId = prefId;
    order.siteId = payment.site_id;
    order.processingMode = payment.processing_mode;
    order.merchantAccountId = payment.merchant_account_id;
    order.payerEmail = payment.payer?.email;
    order.metadata = payment.metadata;
    order.paymentDetails = {
      status: payment.status,
      status_detail: payment.status_detail,
      payment_method_id: payment.payment_method_id,
      payment_type_id: payment.payment_type_id,
      installments: payment.installments,
      transaction_amount: payment.transaction_amount,
      date_approved: payment.date_approved,
      date_created: payment.date_created,
      last_updated: payment.last_modified,
    };

    await order.save();

    console.log("✅ Pedido actualizado a estado:", estadoMapped);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('❌ Error en webhook:', error);
    return new Response('Error en webhook', { status: 500 });
  }
}
