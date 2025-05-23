import { NextResponse } from "next/server";
import Order from "../../../models/Order";
import { MercadoPagoConfig, Payment } from "mercadopago";

// Configuración reutilizable de MercadoPago
const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { timeout: 10000 } // Mayor timeout para operaciones batch
});

// Limitar a 100 pedidos por ejecución para no saturar
const MAX_ORDERS_TO_PROCESS = 100; 

export async function POST() {
  try {
    // 1. Obtener pedidos pendientes con paginación
    const pedidos = await Order.find({ estado: "pendiente" })
      .limit(MAX_ORDERS_TO_PROCESS)
      .select('_id paymentId estado') // Solo los campos necesarios
      .lean(); // Mejor performance

    if (!pedidos.length) {
      return NextResponse.json(
        { success: true, message: "No hay pedidos pendientes para verificar" },
        { status: 200 }
      );
    }

    // 2. Procesar cada pedido
    const resultados = [];
    const paymentClient = new Payment(mercadopago);

    for (const pedido of pedidos) {
      try {
        if (!pedido.paymentId) {
          resultados.push({
            pedidoId: pedido._id,
            status: "skipped",
            reason: "Sin paymentId"
          });
          continue;
        }

        // 3. Verificar estado con MP (usando SDK oficial)
        const mpData = await paymentClient.get({ id: pedido.paymentId });
        const nuevoEstado = mpData.status;

        // 4. Actualizar si es necesario
        if (nuevoEstado === "approved" || nuevoEstado === "cancelled") {
          const estadoActualizado = nuevoEstado === "approved" ? "pagado" : "cancelado";
          
          await Order.findByIdAndUpdate(
            pedido._id,
            { estado: estadoActualizado },
            { new: true }
          );

          resultados.push({
            pedidoId: pedido._id,
            paymentId: pedido.paymentId,
            oldStatus: pedido.estado,
            newStatus: estadoActualizado,
            status: "updated"
          });
        } else {
          resultados.push({
            pedidoId: pedido._id,
            status: "no_change",
            currentStatus: pedido.estado
          });
        }
      } catch (error) {
        resultados.push({
          pedidoId: pedido._id,
          status: "error",
          error: error.message
        });
      }
    }

    // 5. Retornar resultados detallados
    return NextResponse.json({
      success: true,
      processed: resultados.length,
      resultados
    });

  } catch (error) {
    console.error("Error verificando pedidos:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Error interno del servidor",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}