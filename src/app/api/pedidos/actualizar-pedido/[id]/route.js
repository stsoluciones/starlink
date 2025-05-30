// app/api/pedidos/actualizar-pedido/[id]/route.js

import { connectDB } from "../../../../../lib/mongodb"; // Asumiendo rutas correctas
import Order from "../../../../../models/Order"; // Asumiendo rutas correctas

// Regex simple para validar formato de ObjectId (24 caracteres hexadecimales)
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export async function PUT(req, { params }) {
  await connectDB();

  const { id } = params; // ID del pedido
  const { nuevoEstado } = await req.json();

  // Validación del formato del ID en el backend
  if (!id || !objectIdRegex.test(id)) {
    return new Response(JSON.stringify({ success: false, error: "Formato de ID de pedido no válido" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const estadosValidos = ["pendiente", "pagado", "procesando", "enviado", "entregado", "cancelado"];
  if (!nuevoEstado || !estadosValidos.includes(nuevoEstado)) {
    return new Response(JSON.stringify({ success: false, error: "Estado no válido proporcionado" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const pedido = await Order.findByIdAndUpdate(
      id,
      { estado: nuevoEstado },
      { new: true, runValidators: true } // runValidators es buena práctica si tienes validaciones en el schema
    );

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
    console.error("Error al actualizar estado del pedido (API):", error);
    // Si el error es un CastError, es probable que la validación regex anterior ya lo hubiera atrapado.
    if (error.name === 'CastError') {
        return new Response(JSON.stringify({ success: false, error: "Error de casteo: ID de pedido no válido" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    return new Response(JSON.stringify({ success: false, error: "Error interno del servidor al actualizar el pedido" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}