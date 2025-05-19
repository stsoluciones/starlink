import { MercadoPagoConfig, Payment } from 'mercadopago';
import Order from '../../../models/Order';  // Asegurate que el path sea correcto
import User from '../../../models/User';    // Para buscar info del usuario

const mercadopago = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

export async function POST(req) {
  const { payment_id } = await req.json();

  if (!payment_id) {
    return new Response(JSON.stringify({ error: 'Falta el payment_id' }), { status: 400 });
  }

  try {
    // Consultar el estado del pago en MP
    const payment = await new Payment(mercadopago).get({ id: payment_id });

    if (payment.body.status !== 'approved') {
      return new Response(JSON.stringify({ error: 'El pago no fue aprobado' }), { status: 400 });
    }

    const metadata = payment.body.metadata;
    const items = payment.body.additional_info?.items || [];

    // Buscar usuario por UID (desde metadata o email)
    const user = await User.findOne({ uid: metadata.uid }); // Suponiendo que mandás el UID

    if (!user) {
      return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), { status: 404 });
    }

    // Convertir items para order
    const orderItems = items.map((item) => ({
      producto: item.id,  // O el _id si lo tenés
      cantidad: item.quantity,
      precioUnitario: item.unit_price
    }));

    const nuevaOrden = new Order({
      usuarioUid: user.uid,
      usuarioInfo: {
        nombreCompleto: user.nombreCompleto,
        correo: user.correo
      },
      items: orderItems,
      direccionEnvio: user.direccion,
      estado: 'pendiente',
      total: payment.body.transaction_amount,
      fechaPedido: new Date()
    });

    await nuevaOrden.save();

    return Response.json({ success: true, orderId: nuevaOrden._id });
  } catch (error) {
    console.error('Error al guardar el pedido:', error);
    return new Response(JSON.stringify({ error: 'No se pudo guardar el pedido' }), { status: 500 });
  }
}
