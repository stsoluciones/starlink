import { MercadoPagoConfig, Preference } from 'mercadopago';
import userData from '../../../components/constants/userData';

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
      unit_price: Number(item.precio),
      quantity: Number(item.quantity),
      currency_id: "ARS",
    }));

    //console.log("Items para preferencia:", items);

    const preference = new Preference(client);
    
    const response = await preference.create({
      body: {
        items,
        metadata: { uid, cart },
        back_urls: {
          // success: `http://localhost:3000/mp/success`,
          // failure: `http://localhost:3000/mp/failure`,
          // pending: `http://localhost:3000/mp/pending`,
          success: `${userData.urlHttps}/mp/success`,
          failure: `${userData.urlHttps}/mp/failure`,
          pending: `${userData.urlHttps}/mp/pending`,
        },
        auto_return: "approved",
      }
    });

    //console.log("Respuesta de MercadoPago:", response);

    return new Response(
      JSON.stringify({ init_point: response.init_point }),
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