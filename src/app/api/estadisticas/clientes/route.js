import { NextResponse } from 'next/server';
import User from '../../../../models/User';

export async function GET(request) {
  try {
    const [totalCustomers, customersWithOrders] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ orders: { $exists: true, $not: { $size: 0 } }})
    ]);

    // Obtener nuevos clientes este mes
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const newCustomers = await User.countDocuments({
      createdAt: { $gte: thisMonth }
    });

    return NextResponse.json({
      totalCustomers,
      customersWithOrders,
      conversionRate: totalCustomers > 0 ? (customersWithOrders / totalCustomers) * 100 : 0,
      newCustomersThisMonth: newCustomers
    });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    return NextResponse.json(
      { error: 'Error fetching customer statistics', details: error.message },
      { status: 500 }
    );
  }
}