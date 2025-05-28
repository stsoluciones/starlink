import { NextResponse } from 'next/server';
import Order from '../../../../models/Order';
import { getDateRange } from '../statsUtils';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const timeRange = searchParams.get('rango') || 'mes';
  const limit = parseInt(searchParams.get('limite')) || 3;

  const { startDate, endDate } = getDateRange(timeRange);

  try {
    const topSellingProducts = await Order.aggregate([
      { $match: { estado: 'entregado', fechaPedido: { $gte: startDate, $lte: endDate } } },
      { $unwind: '$items' },
      { 
        $group: {
          _id: '$items.producto',
          totalSoldQuantity: { $sum: '$items.cantidad' },
          totalRevenue: { $sum: { $multiply: ['$items.cantidad', '$items.precioUnitario'] } }
        }
      },
      { $sort: { totalSoldQuantity: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          productId: '$_id',
          productName: '$productInfo.nombre',
          productImage: '$productInfo.imagen',
          totalSoldQuantity: 1,
          totalRevenue: 1,
          _id: 0
        }
      }
    ]);

    return NextResponse.json({
      timeRange,
      startDate,
      endDate,
      topSellingProducts
    });
  } catch (error) {
    console.error('Error fetching product stats:', error);
    return NextResponse.json(
      { error: 'Error fetching product statistics', details: error.message },
      { status: 500 }
    );
  }
}