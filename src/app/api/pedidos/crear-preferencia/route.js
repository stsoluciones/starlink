//app/api/pedidos/crear-preferencia/route.js
import { MercadoPagoConfig, Preference } from 'mercadopago';
import userData from '../../../../components/constants/userData';


const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { timeout: 5000 } // opcional
});

export async function POST(req) {
  try {
    //console.log("Iniciando creación de preferencia");
    const { cart, uid } = await req.json();
    //console.log("cart:", cart);
    //console.log("uid:", uid);

    const items = cart.map(item => ({
      id: item.cod_producto,
      title: item.nombre,
      foto_1_1: item.foto_1_1,
      unit_price: Number(item.precio),
      quantity: Number(item.quantity),
      currency_id: "ARS",
    }));

    //console.log("Items para preferencia:", items);

    const preference = new Preference(client);
    const external_reference = `order_${uid}_${new Date().getTime()}`; // Generar referencia externa única
    const response = await preference.create({
      body: {
        items,
        metadata: { uid, cart },
        notification_url: `${userData.urlHttps}/api/pedidos/webhook`,
        external_reference: external_reference,
        back_urls: {
          // success: `http://localhost:3000/mp/success`,
          // failure: `http://localhost:3000/mp/failure`,
          success: `${userData.urlHttps}/mp/success`,
          failure: `${userData.urlHttps}/mp/failure`,
          pending: `${userData.urlHttps}/mp/pending`,
        },
        auto_return: "approved",
      }
    });

    return new Response(
      JSON.stringify({ init_point: response.init_point, external_reference: response.external_reference }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error al crear la preferencia:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error al generar preferencia" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
}