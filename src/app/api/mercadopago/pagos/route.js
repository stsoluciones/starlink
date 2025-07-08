// app/api/mercadopago/pagos/route.js
import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import Order from "../../../../models/Order";
import { connectDB } from "../../../../lib/mongodb";
import userData from "../../../../components/constants/userData";

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

    // Si no hay paymentId, no podemos verificar
    if (!order.paymentId) {
      return NextResponse.json({ 
        success: false, 
        message: "Esta orden no tiene un ID de pago asociado" 
      });
    }

    // Obtener los detalles del pago desde MercadoPago
    const payment = new Payment(client);
    const paymentDetails = await payment.get({ id: order.paymentId });
    
    //console.log("Detalles del pago:", paymentDetails);

    // Actualizar el estado según el estado del pago
    let newStatus = order.estado;
    
    if (paymentDetails.status === "approved") {
      newStatus = "pagado";
    } else if (paymentDetails.status === "pending") {
      newStatus = "pendiente";
    } else if (paymentDetails.status === "cancelled" || paymentDetails.status === "rejected") {
      newStatus = "cancelado";
    }

    // Actualizar la orden en la base de datos
    const updatedOrder = await Order.findByIdAndUpdate(
      order._id,
      {
        estado: newStatus,
        collectionStatus: paymentDetails.status,
        paymentType: paymentDetails.payment_type_id,
        merchantOrderId: paymentDetails.order?.id,
        payerEmail: paymentDetails.payer?.email,
        metadata: paymentDetails
      },
      { new: true }
    );
    // 📨 Enviar notificación solo si el nuevo estado es "pagado"
    if (newStatus === "pagado") {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/notificador`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clienteEmail: updatedOrder.usuarioInfo.correo,
            clienteNombre: updatedOrder.usuarioInfo.nombreCompleto || 'Cliente',
            estadoPedido: "pagado",
            adminEmail: userData.email, // almacenalo en .env
            numeroPedido: updatedOrder._id,
            montoTotal: updatedOrder.total ?? 0,
          }),
        });
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