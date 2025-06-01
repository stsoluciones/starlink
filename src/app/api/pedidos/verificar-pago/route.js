// app/api/pedidos/verificar-pago/route.js

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get("payment_id");

  if (!paymentId) {
    return new Response(JSON.stringify({ error: "Falta payment_id" }), {
      status: 400,
    });
  }

  try {
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
    });

    const paymentData = await res.json();

    if (paymentData.status === "approved") {
      return new Response(JSON.stringify({ success: true, paymentData }), {
        status: 200,
      });
    }

    return new Response(JSON.stringify({ success: false, paymentData }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error verificando pago:", error);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
    });
  }
}
