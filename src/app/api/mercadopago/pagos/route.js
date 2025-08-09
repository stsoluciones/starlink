import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import Order from "../../../../models/Order";
import mercadopago from "mercadopago";
import { notificador } from "../../../../lib/notificador";

// Configuración MercadoPago (usar variable de entorno)
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

export async function GET(req) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    // Validar orderId
    if (!orderId || !orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ success: false, message: "orderId inválido" }, { status: 400 });
    }

    // Buscar orden
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: "Orden no encontrada" }, { status: 404 });
    }

    // Si ya está pagada y aprobada en MP, no seguimos
    if (order.estado === "pagado") {
      return NextResponse.json({ success: true, message: "Orden ya está pagada", order });
    }

    // Validar paymentId
    if (!order.paymentId) {
      return NextResponse.json({ success: false, message: "Orden sin paymentId" }, { status: 400 });
    }

    // Consultar a MercadoPago
    let paymentDetails;
    try {
      const mpResponse = await mercadopago.payment.findById(order.paymentId);
      paymentDetails = mpResponse.body;
    } catch (err) {
      console.error("Error consultando MercadoPago:", err);
      return NextResponse.json({ success: false, message: "Error consultando MercadoPago" }, { status: 500 });
    }

    // Mapear estado de MP a estado interno
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

    // Actualizar solo si hay cambios
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        estado: newStatus,
        paymentMetadata: {
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

    // Notificar si pasó a pagado
    if (newStatus === "pagado" && order.estado !== "pagado") {
      await notificador(updatedOrder);
    }

    return NextResponse.json({ success: true, order: updatedOrder });

  } catch (error) {
    console.error("Error en verificación de pago:", error);
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 });
  }
}
