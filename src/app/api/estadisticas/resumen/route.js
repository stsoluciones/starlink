import { NextResponse } from 'next/server';
import Order from '../../../../models/Order';
import { getDateRange } from '../statsUtils';
import {connectDB} from '../../../../lib/mongodb';

export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const timeRange = searchParams.get('rango') || 'mes';
  // console.log('timeRange:', timeRange);
  

  const { startDate, endDate } = getDateRange(timeRange);
  // console.log('startDate:', startDate);
  // console.log('endDate:', endDate);
  
  try {
    const [
      salesData,
      ordersByStatus,
      cancelledOrdersData,
      paymentMethodsData,
      abandonedCartsCount
    ] = await Promise.all([
      // 1. Ventas entregadas
      Order.aggregate([
        { $match: { estado: 'entregado', fechaPedido: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, totalAmount: { $sum: '$total' }, orderCount: { $sum: 1 } } }
      ]),
      
      // 2. Pedidos por estado
      Order.aggregate([
        { $match: { fechaPedido: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$estado', count: { $sum: 1 } } }
      ]),
      
      // 3. Pedidos cancelados
      Order.aggregate([
        { $match: { estado: 'cancelado', fechaPedido: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, totalAmount: { $sum: '$total' }, orderCount: { $sum: 1 } } }
      ]),
      
      // 4. Métodos de pago (versión corregida)
      Order.aggregate([
        { 
          $match: { 
            fechaPedido: { $gte: startDate, $lte: endDate },
            estado: { $ne: 'cancelado' } 
          } 
        },
        { 
          $group: { 
            _id: { $ifNull: ['$paymentMethod', 'no especificado'] }, 
            count: { $sum: 1 } 
          } 
        },
        { 
          $project: { 
            _id: 0, 
            method: '$_id', 
            count: 1 
          } 
        }
      ]),
      
      // 5. Carritos abandonados
      Order.countDocuments({
        estado: 'pendiente',
        fechaPedido: { $gte: startDate, $lte: endDate },
        updatedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })
    ]);

    const totalOrders = await Order.countDocuments({ fechaPedido: { $gte: startDate, $lte: endDate } });
    const deliveredSales = salesData[0]?.totalAmount || 0;
    const deliveredOrders = salesData[0]?.orderCount || 0;
    const cancelledSales = cancelledOrdersData[0]?.totalAmount || 0;
    const cancelledOrders = cancelledOrdersData[0]?.orderCount || 0;

    // Convertir paymentMethodsData a objeto
    const paymentMethods = {};
    paymentMethodsData.forEach(item => {
      paymentMethods[item.method] = item.count;
    });

    return NextResponse.json({
      timeRange,
      startDate,
      endDate,
      totalSales: deliveredSales,
      cancelledSales,
      netSales: deliveredSales - cancelledSales,
      totalOrders,
      deliveredOrders,
      cancelledOrders,
      ordersByStatus: Object.fromEntries(ordersByStatus.map(item => [item._id, item.count])),
      paymentMethods,
      abandonedCarts: abandonedCartsCount,
      cancellationRate: totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0
    });
  } catch (error) {
    console.error('Error fetching summary stats:', error);
    return NextResponse.json(
      { error: 'Error fetching summary statistics', details: error.message },
      { status: 500 }
    );
  }
}