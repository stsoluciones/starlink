import { NextResponse } from 'next/server';
import Order from '../../../../models/Order';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const months = parseInt(searchParams.get('meses')) || 12;

  try {
    const date = new Date();
    date.setMonth(date.getMonth() - months);

    const monthlyTrend = await Order.aggregate([
      { 
        $match: { 
          estado: 'entregado',
          fechaPedido: { $gte: date }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$fechaPedido' },
            month: { $month: '$fechaPedido' }
          },
          totalSales: { $sum: '$total' },
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          period: {
            $concat: [
              { $toString: { $month: '$fechaPedido' } },
              '/',
              { $toString: { $year: '$fechaPedido' } }
            ]
          },
          totalSales: 1,
          totalOrders: 1
        }
      }
    ]);

    return NextResponse.json({
      months,
      monthlyTrend
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    return NextResponse.json(
      { error: 'Error fetching sales trends', details: error.message },
      { status: 500 }
    );
  }
}