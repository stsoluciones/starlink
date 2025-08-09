"use server"
// app/api/mercadopago/pagos/route.js
import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import Order from "../../../../models/Order";
import { connectDB } from "../../../../lib/mongodb";
import notificador from "../../../../Utils/notificador";

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
        await notificador(updatedOrder);
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