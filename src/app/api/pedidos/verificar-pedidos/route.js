// app/api/pedidos/verificar-pedidos/route.js

import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import Order from "../../../../models/Order";
import verifyMercadoPagoPayment from "../../../../lib/verifyMercadoPagoPayment";

const MAX_ORDERS_TO_PROCESS = 100;

export async function POST() {
  try {
    await connectDB();

    const pedidos = await Order.find({ estado: "pendiente", paymentMethod: "mercadopago" })
      .limit(MAX_ORDERS_TO_PROCESS)
      .select("_id paymentId estado")
      .lean();

    if (!pedidos.length) {
      return NextResponse.json(
        { success: true, message: "No hay pedidos pendientes para verificar" },
        { status: 200 }
      );
    }

    const resultados = await Promise.allSettled(
      pedidos.map(async (pedido) => {
        try {
          if (!pedido.paymentId) {
            return {
              pedidoId: pedido._id,
              status: "skipped",
              reason: "Sin paymentId",
            };
          }

          const mpData = await verifyMercadoPagoPayment(pedido.paymentId);
          const nuevoEstadoMP = mpData.status;

          if (nuevoEstadoMP === "approved" || nuevoEstadoMP === "cancelled") {
            const nuevoEstadoOrder = nuevoEstadoMP === "approved" ? "pagado" : "cancelado";

            await Order.findByIdAndUpdate(
              pedido._id,
              {
                estado: nuevoEstadoOrder,
                collectionId: mpData.collection_id || null,
                collectionStatus: mpData.status || null,
                paymentType: mpData.payment_type_id || null,
                merchantOrderId: mpData.merchant_order_id || null,
                preferenceId: mpData.preference_id || null,
                siteId: mpData.site_id || null,
                processingMode: mpData.processing_mode || null,
                merchantAccountId: mpData.merchant_account_id || null,
                payerEmail: mpData.payer?.email || null,
              },
              { new: true }
            );

            return {
              pedidoId: pedido._id,
              paymentId: pedido.paymentId,
              oldStatus: pedido.estado,
              newStatus: nuevoEstadoOrder,
              status: "updated",
            };
          }

          return {
            pedidoId: pedido._id,
            status: "no_change",
            currentStatus: pedido.estado,
            mercadoPagoStatus: nuevoEstadoMP,
          };
        } catch (error) {
          return {
            pedidoId: pedido._id,
            status: "error",
            error: error.message,
          };
        }
      })
    );

    const resultadosFinales = resultados.map((r) =>
      r.status === "fulfilled" ? r.value : { status: "error", error: r.reason?.message }
    );

    return NextResponse.json({
      success: true,
      processed: resultadosFinales.length,
      resultados: resultadosFinales,
    });
  } catch (error) {
    console.error("Error verificando pedidos:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
