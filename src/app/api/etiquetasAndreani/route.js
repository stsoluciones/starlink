// En /api/generar-etiquetas/route.js
import Order from "../../../models/Order";
import { connectDB } from "../../../lib/mongodb";
import { obtenerTokenAndreani, crearEnvio, obtenerEtiquetaPDF } from "../../../lib/andreani";

export async function POST(req) {
  await connectDB();

  try {
    const { pedidos } = await req.json();

    const pedidosSeleccionados = await Order.find({
      _id: { $in: pedidos },
      estado: 'pagado',
    }).lean();

    if (pedidosSeleccionados.length === 0) {
      return new Response(JSON.stringify({ error: 'No se encontraron pedidos válidos' }), {
        status: 400,
      });
    }

    const token = await obtenerTokenAndreani();

    const etiquetas = [];

    for (const pedido of pedidosSeleccionados) {
      const envio = await crearEnvio(pedido, token);
      const etiqueta = await obtenerEtiquetaPDF(envio.id, token);
      etiquetas.push({
        pedidoId: pedido._id,
        etiqueta: Buffer.from(etiqueta).toString('base64'), // se puede enviar al frontend como base64
      });
    }

    return new Response(JSON.stringify({ etiquetas }), {
      status: 200,
    });

  } catch (error) {
    console.error('Error al generar etiquetas:', error);
    return new Response(JSON.stringify({ error: 'Error al generar etiquetas' }), {
      status: 500,
    });
  }
}
