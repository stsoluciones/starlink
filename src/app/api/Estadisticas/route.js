// app/api/estadisticas/route.js
import { NextResponse } from 'next/server';
import Order from '../../../models/Order';
import Product from '../../../models/product';
import User from '../../../models/User';

export async function GET() {
  try {
    const [
      ventasData,
      pedidosPorEstado,
      productosMasVendidos,
      tendenciaMensual,
      clientesData,
      ticketData,
      carritosAbandonadosCount,
      canceladosData
    ] = await Promise.all([
      // 1. Ventas totales de pedidos entregados
      Order.aggregate([
        { $match: { estado: 'entregado' } },
        {
          $group: {
            _id: null,
            total: { $sum: '$total' },
            count: { $sum: 1 }
          }
        }
      ]),

      // 2. Pedidos por estado
      Order.aggregate([
        {
          $group: {
            _id: '$estado',
            count: { $sum: 1 }
          }
        }
      ]),

      // 3. Productos más vendidos (top 3)
      Order.aggregate([
        { $unwind: '$items' },
        { $match: { estado: 'entregado' } },
        {
          $group: {
            _id: '$items.producto',
            ventas: { $sum: '$items.cantidad' }
          }
        },
        { $sort: { ventas: -1 } },
        { $limit: 3 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'productoInfo'
          }
        },
        { $unwind: '$productoInfo' },
        {
          $project: {
            nombre: '$productoInfo.nombre',
            ventas: 1,
            imagen: '$productoInfo.imagen'
          }
        }
      ]),

      // 4. Tendencia mensual de ventas en los últimos 12 meses
      Order.aggregate([
        {
          $match: {
            estado: 'entregado',
            fechaPedido: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 11))
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$fechaPedido' },
              month: { $month: '$fechaPedido' }
            },
            totalVentas: { $sum: '$total' },
            totalPedidos: { $sum: 1 }
          }
        },
        {
          $sort: {
            '_id.year': 1,
            '_id.month': 1
          }
        },
        {
          $project: {
            mes: {
              $concat: [
                { $toString: '$_id.month' },
                '/',
                { $toString: '$_id.year' }
              ]
            },
            totalVentas: 1,
            totalPedidos: 1
          }
        }
      ]),

      // 5. Datos de clientes
      Promise.all([
        User.countDocuments({}),
        User.countDocuments({ orders: { $exists: true, $not: { $size: 0 } } })
      ]),

      // 6. Ticket promedio
      Order.aggregate([
        { $match: { estado: 'entregado' } },
        {
          $group: {
            _id: null,
            totalVentas: { $sum: '$total' },
            totalPedidos: { $sum: 1 }
          }
        }
      ]),

      // 7. Carritos abandonados
      Order.countDocuments({
        estado: 'pendiente',
        fechaPedido: {
          $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }),

      // 8. Datos de pedidos cancelados
      Order.aggregate([
        { $match: { estado: 'cancelado' } },
        {
          $group: {
            _id: null,
            total: { $sum: '$total' },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Procesamiento de datos
    const ventasEntregados = ventasData[0]?.total || 0;
    const ventasCancelados = canceladosData[0]?.total || 0;
    const ventasNetas = ventasEntregados - ventasCancelados;

    const pedidosEntregados = ventasData[0]?.count || 0;
    const pedidosCancelados = canceladosData[0]?.count || 0;
    const totalPedidos = await Order.countDocuments({});

    const estadosObj = {};
    pedidosPorEstado.forEach(item => {
      estadosObj[item._id] = item.count;
    });

    const [totalClientes, clientesConPedidos] = clientesData;

    const ticketPromedio = ticketData[0]
      ? ticketData[0].totalVentas / ticketData[0].totalPedidos
      : 0;

    return NextResponse.json({
      ventasTotales: ventasEntregados,
      ventasCanceladas: ventasCancelados,
      ventasNetas,
      totalPedidos,
      pedidosEntregados,
      pedidosCancelados,
      pedidosPorEstado: estadosObj,
      productosMasVendidos,
      tendenciaMensual,
      totalClientes,
      clientesConPedidos,
      ticketPromedio: parseFloat(ticketPromedio.toFixed(2)),
      carritosAbandonados: carritosAbandonadosCount,
      tasaCancelacion:
        totalPedidos > 0
          ? (pedidosCancelados / totalPedidos * 100).toFixed(2) + '%'
          : '0%'
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas', details: error.message },
      { status: 500 }
    );
  }
}
