// app/api/estado-pago/route.js

import { MercadoPagoConfig, Payment } from "mercadopago";

const mercadopago = MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get("payment_id");

  if (!paymentId) {
    return new Response(JSON.stringify({ error: "Falta el payment_id" }), {
      status: 400,
    });
  }

  try {
    const payment = await new Payment(mercadopago).get({ id: paymentId });
    return Response.json(payment.body);
  } catch (error) {
    console.error("Error al obtener el estado del pago:", error);
    return new Response(JSON.stringify({ error: "No se pudo obtener el estado del pago" }), {
      status: 500,
    });
  }
}
