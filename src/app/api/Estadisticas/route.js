// app/api/Estadisticas/route.js
import { NextResponse } from 'next/server';
import Order from '../../../models/Order';
import Product from '../../../models/product';
import User from '../../../models/User';

export async function GET() {
  try {
    // 1. Ventas totales
    const ventasTotales = await Order.aggregate([
      { $match: { estado: 'entregado' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // 2. Pedidos por estado
    const pedidosPorEstado = await Order.aggregate([
      { $group: { _id: '$estado', count: { $sum: 1 } } },
      { $project: { estado: '$_id', count: 1, _id: 0 } }
    ]);

    // Convertir a formato objeto
    const estadosObj = {};
    pedidosPorEstado.forEach(item => {
      estadosObj[item.estado] = item.count;
    });

    // 3. Productos más vendidos
    const productosMasVendidos = await Order.aggregate([
      { $unwind: '$items' },
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
          _id: 0
        } 
      }
    ]);

    // 4. Tendencia mensual
    const tendenciaMensual = await Order.aggregate([
      { $match: { estado: 'entregado' } },
      {
        $group: {
          _id: {
            year: { $year: '$fechaPedido' },
            month: { $month: '$fechaPedido' }
          },
          ventas: { $sum: '$total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 },
      {
        $project: {
          mes: {
            $let: {
              vars: {
                meses: ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
              },
              in: { $arrayElemAt: ['$$meses', '$_id.month'] }
            }
          },
          ventas: 1,
          _id: 0
        }
      }
    ]);

    // 5. Clientes
    const [totalClientes, clientesConPedidos, usuariosConPedidos] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ orders: { $exists: true, $not: { $size: 0 } } }),
      
      // Consulta de diagnóstico
      User.aggregate([
        {
          $lookup: {
            from: "orders",
            localField: "_id",
            foreignField: "usuarioUid",
            as: "pedidos"
          }
        },
        {
          $project: {
            nombre: "$nombreCompleto",
            correo: 1,
            totalPedidos: { $size: "$pedidos" }
          }
        }
      ])
    ]);

    console.log("Total de clientes:", totalClientes);
    console.log("Clientes con pedidos:", clientesConPedidos);
    console.log("Detalle usuarios:", usuariosConPedidos);

    // 6. Ticket promedio
    const ticketData = await Order.aggregate([
      { $match: { estado: 'entregado' } },
      {
        $group: {
          _id: null,
          totalVentas: { $sum: '$total' },
          totalPedidos: { $sum: 1 }
        }
      }
    ]);

    const ticketPromedio = ticketData.length > 0 
      ? ticketData[0].totalVentas / ticketData[0].totalPedidos 
      : 0;

    // 7. Carritos abandonados
    const hoy = new Date();
    const treintaDiasAtras = new Date(hoy.getTime() - (30 * 24 * 60 * 60 * 1000));

    const carritosAbandonados = await Order.countDocuments({
    estado: 'pendiente',
    fechaPedido: { $lt: treintaDiasAtras }
    });

    return NextResponse.json({
      ventasTotales: ventasTotales.length > 0 ? ventasTotales[0].total : 0,
      pedidosPorEstado: estadosObj,
      productosMasVendidos,
      tendenciaMensual,
      totalClientes,
      clientesConPedidos,
      ticketPromedio,
      carritosAbandonados
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}