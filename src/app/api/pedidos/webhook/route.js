// app/api/pedidos/webhook/route.js
import Order from '../../../../models/Order';
import { connectDB } from '../../../../lib/mongodb';


export async function POST(req) {
  try {
    const body = await req.json();
    console.log('Webhook body:', body);
    
    const topic = body.type;
    const paymentId = body.data?.id;

    if (topic !== 'payment' || !paymentId) {
      return NextResponse.json({ error: 'Not a payment notification' }, { status: 400 });
    }

    // Traer datos del pago desde MP
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
    });

    const payment = await res.json();

    if (payment.status !== 'approved') {
      return NextResponse.json({ message: 'Payment not approved yet' });
    }

    // Conectar a la DB
    await connectDB();

    // Buscar la orden por pref_id o paymentId
    const order = await Order.findOne({ pref_id: payment?.metadata?.pref_id });

    if (!order) {
      console.warn('Orden no encontrada para pref_id:', payment?.metadata?.pref_id);
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    // Actualizar los datos del pedido
    order.estado = 'pagado';
    order.paymentId = payment.id;
    order.collectionId = payment.collection_id || payment.id;
    order.collectionStatus = payment.status;
    order.paymentType = payment.payment_type_id;
    order.preferenceId = payment.metadata?.pref_id || payment.preference_id;
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en webhook:', error);
    return new Response('Error en webhook', { status: 500 });
  }
}
