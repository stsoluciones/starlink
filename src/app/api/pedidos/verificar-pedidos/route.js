// app/api/pedidos/verificar-pedidos/route.js
import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import Order from '../../../../models/Order';
import { connectDB } from '../../../../lib/mongodb';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

export async function POST(req) {
  try {
    await connectDB();
    const { paymentId, preferenceId } = await req.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: 'paymentId es requerido' },
        { status: 400 }
      );
    }

    // Verificar pago en MercadoPago
    const payment = new Payment(client);
    const paymentDetails = await payment.get({ id: paymentId });

    // Buscar orden relacionada
    const order = await Order.findOne({
      $or: [
        { paymentId },
        { preferenceId },
        { merchantOrderId: paymentDetails.order?.id }
      ]
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar estado
    let newStatus = order.estado;
    if (paymentDetails.status === 'approved') newStatus = 'pagado';
    else if (['pending', 'in_process'].includes(paymentDetails.status)) newStatus = 'pendiente';
    else if (['cancelled', 'rejected'].includes(paymentDetails.status)) newStatus = 'cancelado';

    const updatedOrder = await Order.findByIdAndUpdate(
      order._id,
      {
        estado: newStatus,
        collectionStatus: paymentDetails.status,
        paymentDetails: {
          status: paymentDetails.status,
          status_detail: paymentDetails.status_detail,
          payment_method_id: paymentDetails.payment_method_id,
          payment_type_id: paymentDetails.payment_type_id,
          installments: paymentDetails.installments,
          transaction_amount: paymentDetails.transaction_amount,
          date_approved: paymentDetails.date_approved,
          date_created: paymentDetails.date_created,
          last_updated: paymentDetails.date_last_updated
        }
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      paymentStatus: paymentDetails.status
    });

  } catch (error) {
    console.error('Error en verificar-pago:', error);
    return NextResponse.json(
      { error: error.message || 'Error al verificar pago' },
      { status: 500 }
    );
  }
}