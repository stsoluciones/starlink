// app/api/pedidos/verificar-pendientes/route.js
import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import Order from "../../../../models/Order";
import { connectDB } from "../../../../lib/mongodb";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

// Add this for debugging
export async function OPTIONS() {
  return NextResponse.json({ status: 'OK' });
}

export async function POST(req) {
  try {
    console.log("POST verificar-pendientes called");
    await connectDB();
    
    const body = await req.json();
    console.log("Request body:", body);
    
    if (!body.paymentId) {
      console.error("Missing paymentId");
      return NextResponse.json(
        { error: "Se requiere paymentId" },
        { status: 400 }
      );
    }

    const payment = new Payment(client);
    console.log("Fetching payment details for:", body.paymentId);
    const paymentDetails = await payment.get({ id: body.paymentId });

    const order = await Order.findOne({
      $or: [
        { paymentId: body.paymentId },
        { preferenceId: body.preferenceId },
        { merchantOrderId: paymentDetails.order?.id }
      ]
    });

    if (!order) {
      console.error("Order not found for payment:", body.paymentId);
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    console.log("Updating order status to:", paymentDetails.status);
    const updatedOrder = await Order.findByIdAndUpdate(
      order._id,
      {
        estado: paymentDetails.status === "approved" ? "pagado" : "pendiente",
        collectionStatus: paymentDetails.status,
        paymentDetails: {
          status: paymentDetails.status,
          status_detail: paymentDetails.status_detail,
          payment_method_id: paymentDetails.payment_method_id,
          payment_type_id: paymentDetails.payment_type_id,
          installments: paymentDetails.installments,
          transaction_amount: paymentDetails.transaction_amount,
          date_approved: paymentDetails.date_approved,
          date_created: paymentDetails.date_created,
          last_updated: paymentDetails.date_last_updated
        }
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      paymentStatus: paymentDetails.status
    });

  } catch (error) {
    console.error("Error in POST verificar-pendientes:", error);
    return NextResponse.json(
      { error: error.message || "Error al verificar pago" },
      { status: 500 }
    );
  }
}