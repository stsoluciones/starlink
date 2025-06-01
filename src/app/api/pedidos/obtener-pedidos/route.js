export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import Order from "../../../../models/Order";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const usuarioUid = searchParams.get("usuarioUid");
    const empresa = searchParams.get("empresa");
    const estado = searchParams.get("estado");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const filtros = {};
    if (usuarioUid) filtros["usuarioUid"] = usuarioUid;
    if (empresa) filtros.empresa = empresa;
    if (estado) filtros.estado = estado;

    const pedidos = await Order.find(filtros)
      .sort({ fechaPedido: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Order.countDocuments(filtros);


    return NextResponse.json({ pedidos, total });
  } catch (error) {
    console.error("❌ Error al obtener pedidos:", error);
    return NextResponse.json(
      { message: "Error al obtener pedidos" },
      { status: 500 }
    );
  }
}
