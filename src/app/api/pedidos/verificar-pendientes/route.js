// app/api/pedidos/verificar-pendientes/route.js
import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import Order from "../../../../models/Order";
import { connectDB } from "../../../../lib/mongodb";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

export async function GET() {
  try {
    await connectDB();
    
    // Buscar órdenes pendientes
    const pendingOrders = await Order.find({ estado: "pendiente", paymentMethod: "mercadopago" });
    
    let updatedOrders = [];
    
    for (const order of pendingOrders) {
      if (!order.paymentId) continue;
      
      try {
        const payment = new Payment(client);
        const paymentDetails = await payment.get({ id: order.paymentId });
        
        if (paymentDetails.status === "approved") {
          const updatedOrder = await Order.findByIdAndUpdate(
            order._id,
            {
              estado: "pagado",
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
                last_updated: paymentDetails.date_last_updated,
              }
            },
            { new: true }
          );
          
          updatedOrders.push(updatedOrder);
        }
      } catch (error) {
        console.error(`Error verificando pago ${order.paymentId}:`, error);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      updatedCount: updatedOrders.length,
      updatedOrders 
    });
  } catch (error) {
    console.error("Error al verificar pedidos pendientes:", error);
    return NextResponse.json(
      { success: false, message: "Error al verificar pedidos pendientes" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { paymentId, preferenceId } = await req.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: "Se requiere paymentId" },
        { status: 400 }
      );
    }

    const payment = new Payment(client);
    const paymentDetails = await payment.get({ id: paymentId });

    const order = await Order.findOne({
      $or: [
        { paymentId },
        { preferenceId },
        { merchantOrderId: paymentDetails.order?.id }
      ]
    });

    if (!order) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    let newStatus = order.estado;
    if (paymentDetails.status === "approved") newStatus = "pagado";
    else if (["pending", "in_process"].includes(paymentDetails.status)) newStatus = "pendiente";

    const updatedOrder = await Order.findByIdAndUpdate(
      order._id,
      {
        estado: newStatus,
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
    console.error("Error en POST verificar-pendientes:", error);
    return NextResponse.json(
      { error: error.message || "Error al verificar pago" },
      { status: 500 }
    );
  }
}