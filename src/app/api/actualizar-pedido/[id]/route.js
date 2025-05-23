// app/api/actualizar-pedido/[id]/route.js

import { connectDB } from "../../../../lib/mongodb";
import Order from "../../../../models/Order";

export async function PUT(req, { params }) {
  await connectDB();

  const { id } = params; // ID del pedido
  const { nuevoEstado } = await req.json();

  const estadosValidos = ["pendiente", "pagado", "procesando", "enviado", "entregado", "cancelado"];

  if (!estadosValidos.includes(nuevoEstado)) {
    return new Response(JSON.stringify({ error: "Estado no válido" }), { status: 400 });
  }

  try {
    const pedido = await Order.findByIdAndUpdate(
      id,
      { estado: nuevoEstado },
      { new: true }
    );

    if (!pedido) {
      return new Response(JSON.stringify({ error: "Pedido no encontrado" }), { status: 404 });
    }

    return Response.json({ success: true, pedido });
  } catch (error) {
    console.error("Error al actualizar estado del pedido:", error);
    return new Response(JSON.stringify({ error: "Error interno" }), { status: 500 });
  }
}
