// app/api/pedidos/webhook/route.js
import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import Order from "../../../../models/Order";
import { connectDB } from "../../../../lib/mongodb";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

export async function POST(req) {
  try {
    await connectDB();
    const origin = req.headers.get('origin');
    if (origin && !origin.includes('localhost') && !origin.includes('devtunnels.ms')) {
      return new Response('Not allowed', { status: 403 });
    }
    
    const data = await req.json();
    console.log("Datos recibidos del webhook:", data);

    // Verificar si es una notificación de pago
    if (data.type === "payment") {
      const paymentId = data.data.id;
      
      // Obtener los detalles del pago desde MercadoPago
      const payment = new Payment(client);
      const paymentDetails = await payment.get({ id: paymentId });
      
      console.log("Detalles del pago:", paymentDetails);

      // Buscar la orden relacionada con este pago
      const order = await Order.findOne({
        $or: [
          { paymentId: paymentId },
          { preferenceId: paymentDetails.additional_info?.items?.[0]?.id },
          { merchantOrderId: paymentDetails.order?.id }
        ]
      });

      if (!order) {
        console.error("Orden no encontrada para el pago:", paymentId);
        return NextResponse.json({ success: false, message: "Orden no encontrada" }, { status: 404 });
      }

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
          collectionId: paymentId,
          collectionStatus: paymentDetails.status,
          paymentType: paymentDetails.payment_type_id,
          merchantOrderId: paymentDetails.order?.id,
          payerEmail: paymentDetails.payer?.email,
          metadata: paymentDetails
        },
        { new: true }
      );

      console.log("Orden actualizada:", updatedOrder);
      
      return NextResponse.json({ success: true, order: updatedOrder });
    }

    return NextResponse.json({ success: false, message: "Tipo de notificación no manejado" });
  } catch (error) {
    console.error("Error en el webhook:", error);
    return NextResponse.json(
      { success: false, message: "Error al procesar el webhook" },
      { status: 500 }
    );
  }
}