// app/api/verificar-pedidos/route.js
import { NextResponse } from "next/server";
import Order from "../../../models/Order";

export async function POST() {
  try {
    const pedidos = await Order.find({ estado: "pendiente" });

    for (const pedido of pedidos) {
      const paymentId = pedido.paymentId;
      if (!paymentId) continue;

      const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      });

      const mpData = await res.json();
      const nuevoEstado = mpData.status;

      if (nuevoEstado === "approved" || nuevoEstado === "cancelled") {
        await Order.findByIdAndUpdate(
          pedido._id,
          { estado: nuevoEstado === "approved" ? "pagado" : "cancelado" },
          { new: true }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error verificando pedidos:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
