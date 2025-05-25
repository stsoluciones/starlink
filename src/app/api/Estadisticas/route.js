// app/api/estadisticas/route.js
import { NextResponse } from 'next/server';
import Order from '../../../models/Order';
import Product from '../../../models/product';
import User from '../../../models/User';

export async function GET() {
  try {
    // Ejecutar todas las consultas en paralelo para mejor rendimiento
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
        { $group: { 
          _id: null, 
          total: { $sum: '$total' },
          count: { $sum: 1 } 
        } }
      ]),
      
      // 2. Pedidos por estado
      Order.aggregate([
        { $group: { 
          _id: '$estado', 
          count: { $sum: 1 } 
        } }
      ]),
      
      // 3. Productos más vendidos
      Order.aggregate([
        { $unwind: '$items' },
        { $match: { estado: 'entregado' } }, // Solo contar productos de pedidos entregados
        { $group: { 
          _id: '$items.producto', 
          ventas: { $sum: '$items.cantidad' } 
        } },
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
        { $project: { 
          nombre: '$productoInfo.nombre', 
          ventas: 1,
          imagen: '$productoInfo.imagen' 
        } }
      ]),
      
    // 5. Productos más vendidos (top 5) en el último año (solo entregados)
        Order.aggregate([
        { 
            $match: { 
            estado: 'entregado',
            fechaPedido: { 
                $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
                $lte: new Date() 
            }
            } 
        },
        { $unwind: "$items" }, // Cambiado de "$productos" a "$items"
        {
            $group: {
            _id: "$items.producto", // Cambiado de "$productos.productoId" a "$items.producto"
            nombre: { $first: "$items.producto" }, // Asumiendo que el nombre está en items
            totalVendido: { $sum: "$items.cantidad" },
            totalIngresos: { $sum: { $multiply: ["$items.cantidad", "$items.precioUnitario"] } } // Corregido typo y campo
            }
        },
        { $sort: { totalVendido: -1 } },
        { $limit: 5 },
        {
            $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "productoInfo"
            }
        },
        { $unwind: "$productoInfo" },
        {
            $project: {
            productoId: "$_id",
            nombre: "$productoInfo.nombre", // Usamos el nombre del producto real
            ventas: "$totalVendido",
            ingresos: "$totalIngresos",
            imagen: "$productoInfo.imagen"
            }
        }
        ]),

      // 5. Datos de clientes
      Promise.all([
        User.countDocuments({}),
        User.countDocuments({ orders: { $exists: true, $not: { $size: 0 } } })
      ]),
      
      // 6. Ticket promedio (solo entregados)
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
        fechaPedido: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      
      // 8. Datos de pedidos cancelados
      Order.aggregate([
        { $match: { estado: 'cancelado' } },
        { $group: { 
          _id: null, 
          total: { $sum: '$total' },
          count: { $sum: 1 } 
        } }
      ])
    ]);

    // Procesar los resultados
    const ventasEntregados = ventasData[0]?.total || 0;
    const ventasCancelados = canceladosData[0]?.total || 0;
    const ventasNetas = ventasEntregados - ventasCancelados;
    
    const pedidosEntregados = ventasData[0]?.count || 0;
    const pedidosCancelados = canceladosData[0]?.count || 0;
    const totalPedidos = await Order.countDocuments({});
    
    // Convertir pedidos por estado a objeto
    const estadosObj = {};
    pedidosPorEstado.forEach(item => {
      estadosObj[item._id] = item.count;
    });

    // Procesar datos de clientes
    const [totalClientes, clientesConPedidos] = clientesData;

    // Calcular ticket promedio (solo entregados)
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
      tasaCancelacion: totalPedidos > 0 
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