//app/api/pedidos/obtener-pedidos/route.js
import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import Order from "../../../../models/Order";
import verifyMercadoPagoPayment from "../../../../lib/verifyMercadoPagoPayment";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const usuarioUid = searchParams.get("usuarioUid");
    const empresa = searchParams.get("empresa");
    const estado = searchParams.get("estado");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const verificarPagos = searchParams.get("verificarPagos") === "true";

    const filtros = {};

    if (usuarioUid) filtros.usuarioUid = usuarioUid;
    if (empresa) filtros.empresa = empresa;
    if (estado) filtros.estado = estado;

    const pedidos = await Order.find(filtros)
      .sort({ fechaPedido: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Order.countDocuments(filtros);
    const mapStatusToEstado = {
      approved: 'pagado',
      in_process: 'pendiente',
      rejected: 'cancelado',
      refunded: 'cancelado',
      // otros estados que maneje MP
    };


if (verificarPagos) {
  for (const pedido of pedidos) {
    console.log('⏳ Verificando pedido:', pedido._id, 'paymentId:', pedido.paymentId);

    if (pedido.paymentId) {
      try {
        const pago = await verifyMercadoPagoPayment(pedido.paymentId);
        console.log('✅ Respuesta de MercadoPago:', pago);

        const estadoPago = pago.status;
        const metodoPago = pago.payment_method_id;

        const nuevoEstado = mapStatusToEstado[estadoPago] || pedido.estado;

        console.log('📦 Estado MercadoPago:', estadoPago, '| Nuevo estado:', nuevoEstado);

        await Order.updateOne(
          { _id: pedido._id },
          {
            $set: {
              estadoPago,
              metodoPago,
              estado: nuevoEstado,
              ultimaVerificacionPago: new Date(),
            },
          }
        );
      } catch (error) {
        console.error("❌ Error verificando pago:", error.message);
        pedido.estadoPago = "error";
      }
    } else {
      console.warn("⚠️ Pedido sin paymentId:", pedido._id);
      pedido.estadoPago = "sin paymentId";
    }
  }
}


    return NextResponse.json({ pedidos, total });
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    return NextResponse.json(
      { message: "Error al obtener pedidos" },
      { status: 500 }
    );
  }
}
