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
        if (pedido.paymentId) {
          try {
            const pago = await verifyMercadoPagoPayment(pedido.paymentId);

            const estadoPago = pago.status;
            const metodoPago = pago.payment_method_id;

            pedido.estadoPago = estadoPago;
            pedido.metodoPago = metodoPago;

            // Guardar actualización en la base de datos si es diferente
            const nuevoEstado = mapStatusToEstado[estadoPago] || pedido.estado;

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
            console.error("Error verificando pago:", error.message);
            pedido.estadoPago = "error";
          }
        } else {
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
