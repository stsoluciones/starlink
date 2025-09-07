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
          const adminEmail = process.env.ADMIN_EMAIL || 'admin@slsoluciones.com.ar';
          const numeroPedido = updatedOrder._id.toString();
          const montoTotal = updatedOrder.total || 0;

          await sendEmail({
            to: clienteEmail,
            subject: `Tu pedido #${numeroPedido} ahora está: pagado`,
            html: `<p>Hola ${clienteNombre},</p><p>El estado de tu pedido #${numeroPedido} es: <strong>pagado</strong>.</p>`,
          });

          await sendEmail({
            to: adminEmail,
            subject: `🔔 Pedido #${numeroPedido} en estado pagado`,
            html: `<p>Pedido #${numeroPedido} a nombre de ${clienteNombre} - estado: <strong>pagado</strong>. Monto: ${montoTotal}</p>`,
          });

          updatedOrder.pagoNotificado = true;
          await updatedOrder.save();
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