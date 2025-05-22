import { connectDB } from "../../../lib/mongodb";
import Order from "../../../models/Order";
import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();
    const paymentId = body.data?.id || body.payment_id;

    if (!paymentId) {
      return new Response(
        JSON.stringify({ message: "Falta paymentId" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const existe = await Order.findOne({ paymentId: paymentId.toString() });
    if (existe) {
      return new Response(
        JSON.stringify({ message: "Ya procesado" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const payment = await new Payment(client).get({ id: paymentId });
    if (!payment) {
      return new Response(
        JSON.stringify({ error: "Pago no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const payer = payment.payer;

  const nuevaOrden = new Order({
    paymentId: payment.id.toString(),
    collectionId: payment.id.toString(),
    collectionStatus: payment.status,
    paymentType: payment.payment_type_id,
    merchantOrderId: payment.order?.id?.toString() || "",
    preferenceId: payment.metadata?.preference_id || "",
    siteId: payment.site_id,
    processingMode: payment.processing_mode,
    merchantAccountId: payment.metadata?.merchant_account_id || "",
    payerEmail: payer?.email || "",
    status: payment.status,

    // Agregar estos dos campos requeridos
    total: payment.transaction_amount, // o el campo correcto desde la respuesta
    usuarioUid: payment.payer?.id || "desconocido", // reemplazar si tenés una mejor fuente
  });

    await nuevaOrden.save();

    return new Response(
      JSON.stringify({ message: "Orden guardada", paymentId: payment.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error interno", details: error.message || error }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

