"use server"
// app/api/mercadopago/pagos/route.js
import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import Order from "../../../../models/Order";
import { connectDB } from "../../../../lib/mongodb";
import { sendEmail } from "../../../../lib/mailer";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

export async function POST(req) {
  try {
    await connectDB();
    
    const { orderId } = await req.json();
    
    // Buscar la orden en la base de datos
    const order = await Order.findById(orderId);
    
    if (!order) {
      return NextResponse.json({ success: false, message: "Orden no encontrada" }, { status: 404 });
    }

    if (order.estado === "pagado") {
      return NextResponse.json({ success: true, message: "Orden ya está pagada", order });
    }

    if (!order.paymentId) {
      return NextResponse.json({ success: false, message: "Orden sin paymentId" }, { status: 400 });
    }

    // Obtener los detalles del pago desde MercadoPago
    const payment = new Payment(client);
    const paymentDetails = await payment.get({ id: order.paymentId });
    
    //console.log("Detalles del pago:", paymentDetails);

    // Actualizar el estado según el estado del pago
    const statusMap = {
      approved: "pagado",
      pending: "pendiente",
      in_process: "pendiente",
      rejected: "pendiente",
      cancelled: "cancelado",
      refunded: "cancelado",
    };

    const mpStatus = paymentDetails.status?.toLowerCase() || "pendiente";
    const newStatus = statusMap[mpStatus] || order.estado;

    // Actualizar la orden en la base de datos
    const updatedOrder = await Order.findByIdAndUpdate(
      order._id,
      {
        estado: newStatus,
        collectionStatus: paymentDetails.status,
        paymentType: paymentDetails.payment_type_id,
        merchantOrderId: paymentDetails.order?.id,
        payerEmail: paymentDetails.payer?.email,
        metadata: {
          id: paymentDetails.id,
          status: mpStatus,
          status_detail: paymentDetails.status_detail,
          transaction_amount: paymentDetails.transaction_amount,
          date_approved: paymentDetails.date_approved,
          date_created: paymentDetails.date_created,
          payer: paymentDetails.payer,
        },
      },
      { new: true }
    );
    // 📨 Enviar notificación solo si el nuevo estado es "pagado"
    if (newStatus === "pagado" && order.estado !== "pagado") {
      try {
        // si ya fue notificado, evitar reenviar
        if (!updatedOrder.pagoNotificado) {
          const clienteEmail = updatedOrder.usuarioInfo?.correo || '';
          const clienteNombre = updatedOrder.usuarioInfo?.nombreCompleto || 'Cliente';
          const adminEmail = process.env.ADMIN_EMAIL || 'infostarlinksoluciones@gmail.com';
          const numeroPedido = updatedOrder._id.toString();
          const montoTotal = updatedOrder.total || 0;

          await sendEmail({
            to: clienteEmail,
            subject: `Tu pedido #${numeroPedido} ahora está: pagado`,
            html: `<div style="font-family: 'Segoe UI', sans-serif; background-color: #F5F8FA; padding: 24px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
            <div style="background-color: #F3781B; padding: 16px; text-align: center;">
              <img src="https://slsoluciones.com.ar/logos/logo.webp" alt="Logo" style="height: 60px; margin: 0 auto;" />
            </div>
            <div style="padding: 32px;">
              <h2 style="font-size: 20px; margin-bottom: 16px; color: #F3781B;">Hola ${clienteNombre},</h2>
              <p style="font-size: 16px; color: #374151; margin-bottom: 16px;">
                Te informamos que el estado de tu pedido <strong>#${numeroPedido}</strong> ${estadoPedido === 'pendiente' ? 'está consolidado como' : 'ha sido actualizado a'} 
                <span style="font-weight: bold; color: #1a2f98;">${estadoPedido}</span>.
              </p>
              <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">${estadoPedido==='pendiente'? 'Se actualizara a PAGADO cuando corroboremos el ingreso del pago.':''}</p>

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
        </div>`,
          });

          await sendEmail({
            to: adminEmail,
            subject: `🔔 Pedido #${numeroPedido} en estado pagado`,
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
              <span style="font-weight: bold; color: #1a2f98;">${estadoPedido}</span>.
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
        </div>`,
          });

          await Order.updateOne({ _id: updatedOrder._id }, { $set: { pagoNotificado: true } });
        }
      } catch (error) {
        console.error(`⚠️ Error al notificar al cliente/admin por el pago del pedido #${updatedOrder._id}:`, error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder,
      paymentStatus: paymentDetails.status
    });
  } catch (error) {
    console.error("Error al verificar el pago:", error);
    return NextResponse.json(
      { success: false, message: "Error al verificar el pago" },
      { status: 500 }
    );
  }
}