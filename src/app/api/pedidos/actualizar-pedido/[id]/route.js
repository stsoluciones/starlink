// app/api/pedidos/actualizar-pedido/[id]/route.js

import { connectDB } from "../../../../../lib/mongodb";
import Order from "../../../../../models/Order";
import { getEstadoEnvioAndreani } from "../../../../../lib/andreaniTracking"; // ⬅️ ajustá la ruta según tu proyecto

// Regex simple para validar formato de ObjectId (24 caracteres hexadecimales)
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export async function PUT(req, { params }) {
  await connectDB();

  const { id } = params; // ID del pedido
  const body = await req.json();
  const { nuevoEstado, syncDesdeAndreani } = body || {};

  // Validación del formato del ID en el backend
  if (!id || !objectIdRegex.test(id)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Formato de ID de pedido no válido",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // 🔹 MODO ANDREANI: sincronizar desde el estado real del envío
    if (syncDesdeAndreani) {
      const pedido = await Order.findById(id);

      if (!pedido) {
        return new Response(
          JSON.stringify({ success: false, error: "Pedido no encontrado" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (!pedido.trackingCode) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "El pedido no tiene trackingCode asociado",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Consultar a Andreani
      const infoEstado = await getEstadoEnvioAndreani(pedido.trackingCode);

      const esEntregado =
        /entregado/i.test(infoEstado.descripcion || "") ||
        infoEstado.codigo === "ENTREGADO";

      // Guardar info de Andreani en el pedido
      pedido.andreaniEstado = infoEstado.descripcion;
      pedido.andreaniUltimaActualizacion = new Date();
      pedido.metadata = {
        ...(pedido.metadata || {}),
        andreaniTracking: infoEstado.raw,
      };

      if (esEntregado) {
        pedido.estado = "entregado";
        pedido.fechaEntregado = infoEstado.fecha || new Date();
      }

      await pedido.save();

      return new Response(
        JSON.stringify({
          success: true,
          pedido,
          actualizadoDesdeAndreani: true,
          esEntregado,
          andreani: {
            codigo: infoEstado.codigo,
            descripcion: infoEstado.descripcion,
            fecha: infoEstado.fecha,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 🔹 MODO NORMAL (manual, como ya lo tenías)
    const estadosValidos = [
      "pendiente",
      "pagado",
      "enviado",
      "entregado",
      "cancelado",
    ];

    if (!nuevoEstado || !estadosValidos.includes(nuevoEstado)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Estado no válido proporcionado",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const pedido = await Order.findByIdAndUpdate(
      id,
      { estado: nuevoEstado },
      { new: true, runValidators: true }
    );

    if (!pedido) {
      return new Response(
        JSON.stringify({ success: false, error: "Pedido no encontrado" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ success: true, pedido }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al actualizar estado del pedido (API):", error);

    if (error.name === "CastError") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Error de casteo: ID de pedido no válido",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: "Error interno del servidor al actualizar el pedido",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
