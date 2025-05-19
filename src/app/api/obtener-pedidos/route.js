import Order from "../../../models/Order";
import mongoose from "mongoose";

export async function GET() {
  try {
    // Conectar a MongoDB si no está conectado aún
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    // Obtener pedidos ordenados por fecha descendente
    const pedidos = await Order.find({})
      .sort({ fechaPedido: -1 })
      .lean()
      .exec();

    return new Response(JSON.stringify(pedidos), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    return new Response(JSON.stringify({ error: "Error al obtener pedidos" }), {
      status: 500,
    });
  }
}
