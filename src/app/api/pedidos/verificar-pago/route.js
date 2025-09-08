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

        await sendEmail({ 
          to: clienteEmail, 
          subject: `Tu pedido #${numeroPedido} ahora est\u00e1: pagado`, 
          html: `<div style="font-family: 'Segoe UI', sans-serif; background-color: #F5F8FA; padding: 24px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
            <div style="background-color: #F3781B; padding: 16px; text-align: center;">
              <img src="https://slsoluciones.com.ar/logos/logo.webp" alt="Logo" style="height: 60px; margin: 0 auto;" />
            </div>
            <div style="padding: 32px;">
              <h2 style="font-size: 20px; margin-bottom: 16px; color: #F3781B;">Hola ${clienteNombre},</h2>
              <p style="font-size: 16px; color: #374151; margin-bottom: 16px;">
                Te informamos que el estado de tu pedido <strong>#${numeroPedido}</strong> 'ha sido actualizado a <span style="font-weight: bold; color: #1a2f98;">Pagado</span>.
              </p>

              <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
                Gracias por confiar en nosotros. Si tenés alguna consulta, no dudes en responder a este correo.
              </p>
              <a href="https://slsoluciones.com.ar/Dashboard" style="display: inline-block; background-color: #F3781B; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px;">
                Ver mi pedido
              </a>
            </div>
            <div style="background-color: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">
              © ${new Date().getFullYear()} SLS. Todos los derechos reservados.
            </div>
          </div>
        </div>` });

        const resAdmin = await sendEmail({ 
          to: adminEmail, 
          subject: `\ud83d\udd14 Pedido #${numeroPedido} en estado pagado`,
          html: `<div style="font-family: 'Segoe UI', sans-serif; background-color: #F5F8FA; padding: 24px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
            <h3>Notificación de Pago</h3>
                <div style="background-color: #F3781B; padding: 16px; text-align: center;">
                  <img src="https://slsoluciones.com.ar/logos/logo.webp" alt="Logo" style="height: 60px; margin: 0 auto;" />
                </div>
                <div style="padding: 32px;">
                  <h2 style="font-size: 20px; margin-bottom: 16px; color: #F3781B;">Hola SLS</h2>
                  <p style="font-size: 16px; color: #374151; margin-bottom: 16px;">
                  Te informamos que el estado del pedido <strong>#${numeroPedido}</strong> a nombre de ${clienteNombre} ha sido actualizado a: 
                  <span style="font-weight: bold; color: #1a2f98;">Pagado</span>.
                  </p>
                  <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
                  Por un monto Total: <span style="font-weight: bold; color: #1a2f98;">${montoTotal}</span>.
                  </p>
                  <a href="https://slsoluciones.com.ar/Admin" style="display: inline-block; background-color: #F3781B; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px;">
                  Ver Panel de ADM
                  </a>
                </div>
                <div style="background-color: #F3781B; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">
                  © ${new Date().getFullYear()} SLS. Todos los derechos reservados.
                </div>
              </div>
            </div>` });
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
