// app/api/crear-preferencia/route.js
import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN, // usa variables de entorno
});

export async function POST(req) {
  try {
    const { cart, consulta } = await req.json();

    const items = cart.map((item) => ({
      id: item.cod_producto,
      title: item.nombre,
      unit_price: Number(item.precio),
      quantity: Number(item.quantity),
      currency_id: "ARS",
    }));

    const preference = await mercadopago.preferences.create({
      items,
      metadata: { consulta },
      back_urls: {
        success: "https://tusitio.com/mp/success",
        failure: "https://tusitio.com/mp/failure",
        pending: "https://tusitio.com/mp/pending",
      },
      auto_return: "approved",
    });

    return Response.json({ init_point: preference.body.init_point });
  } catch (error) {
    console.error("Error al crear la preferencia:", error);
    return new Response(JSON.stringify({ error: "Error al generar preferencia" }), {
      status: 500,
    });
  }
}
