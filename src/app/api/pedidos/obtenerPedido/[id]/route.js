// app/api/pedidos/obtener-pedido/[id]/route.js

import { connectDB } from "../../../../../lib/mongodb";
import Order from "../../../../../models/Order";

// Regex simple para validar formato de ObjectId (24 caracteres hexadecimales)
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export async function GET(req, { params }) {
  await connectDB();

  const { id } = params;

  if (!id || !objectIdRegex.test(id)) {
    return new Response(JSON.stringify({ success: false, error: "Formato de ID de pedido no válido" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const pedido = await Order.findById(id);

    if (!pedido) {
      return new Response(JSON.stringify({ success: false, error: "Pedido no encontrado" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, pedido }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Error al obtener el pedido (API):", error);
    return new Response(JSON.stringify({ success: false, error: "Error interno del servidor al obtener el pedido" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
