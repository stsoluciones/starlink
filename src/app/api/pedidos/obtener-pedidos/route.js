export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import Order from "../../../../models/Order";

function mapEstadoMP(status) {
  switch (status) {
    case 'approved':
      return 'pagado';
    case 'pending':
    case 'in_process':
      return 'pendiente';
    case 'rejected':
    case 'cancelled':
    case 'refunded':
    case 'charged_back':
      return 'cancelado';
    default:
      return 'pendiente'; // O un estado como 'desconocido_mp'
  }
}

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
    if (usuarioUid) filtros.usuarioUid = usuarioUid;
    if (empresa) filtros.empresa = empresa;
    if (estado) filtros.estado = estado;    
    
    const pedidos = await Order.find(filtros)
      .sort({ fechaPedido: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Order.countDocuments(filtros);
    //('pedidos', pedidos);
    
    // Solo actualizar si estamos buscando "pendientes"
    if (pedidos.estado === "pendiente") {
      const accessToken = process.env.MP_ACCESS_TOKEN;

      if (!accessToken) {
        console.error("❌ MP_ACCESS_TOKEN no definido.");
      } else {
        // Recorremos los pedidos pendientes
        for (const pedido of pedidos) {
          //console.log('pedido', pedido);
          //console.log('external_reference', pedido.external_reference);
          
          const externalRef = pedido.external_reference;

          try {
            const mpRes = await fetch(
              `https://api.mercadopago.com/v1/payments/search?external_reference=${externalRef}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );
            //console.log('mpRes', mpRes);
            
            const data = await mpRes.json();
            const pago = data.results?.[0];

            if (pago && pago.status !== "pendiente" && pago.status !== pedido.estado) {
              // Actualizamos el pedido si cambió su estado
              await Order.findByIdAndUpdate(pedido._id, {
                estado: mapEstadoMP(pago.status),
                mp_status: pago.status,
                mp_status_detail: pago.status_detail,
                mp_payment_id: pago.id,
              });
            }
          } catch (error) {
            console.error(`❌ Error consultando pago para pedido ${pedido._id}:`, error);
          }
        }
      }
    }

    // Volvemos a consultar los pedidos por si alguno fue actualizado
    const pedidosActualizados = await Order.find(filtros)
      .sort({ fechaPedido: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ pedidos: pedidosActualizados, total });
  } catch (error) {
    console.error("❌ Error al obtener pedidos:", error);
    return NextResponse.json(
      { message: "Error al obtener pedidos" },
      { status: 500 }
    );
  }
}
