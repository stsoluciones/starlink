import Order from "../../../models/Order";
import { connectDB } from "../../../lib/mongodb";
import { URL } from "url";

export async function GET(req) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const estado = searchParams.get("estado");        // valor enviado en query
    const usuarioUid = searchParams.get("usuarioUid");
    const desde = searchParams.get("desde");
    const hasta = searchParams.get("hasta");
    const limit = parseInt(searchParams.get("limit")) || 20;
    const page = parseInt(searchParams.get("page")) || 1;

    const filtros = {};

    if (estado) filtros.estado = estado;               // <-- cambio aquí
    if (usuarioUid) filtros.usuarioUid = usuarioUid;
    if (desde || hasta) {
      filtros.fechaPedido = {};
      if (desde) filtros.fechaPedido.$gte = new Date(desde);
      if (hasta) filtros.fechaPedido.$lte = new Date(hasta);
    }

    const pedidos = await Order.find(filtros)
      .sort({ fechaPedido: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec();

    const total = await Order.countDocuments(filtros);

    return new Response(
      JSON.stringify({
        pedidos,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    return new Response(JSON.stringify({ error: "Error al obtener pedidos" }), {
      status: 500,
    });
  }
}

