// app/api/pedidos/estado/[external_ref]/route.js

import { connectDB } from '../../../../../lib/mongodb';
import Order from '../../../../../models/Order';
// import { verifyUserOrAdminToken } from '@/lib/auth'; // Implementa tu lógica de autenticación

export async function GET(req, { params }) {
  try {
    // const isAuthenticated = await verifyUserOrAdminToken(req);
    // if (!isAuthenticated) {
    //   return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
    // }

    const { external_ref } = params;

    if (!external_ref) {
      return new Response(JSON.stringify({ error: 'External reference es requerida' }), { status: 400 });
    }

    await connectDB();
    const order = await Order.findOne({ external_reference: external_ref })
      .select('estado external_reference createdAt paymentDetails items'); // Selecciona los campos que quieres devolver

    if (!order) {
      return new Response(JSON.stringify({ error: 'Pedido no encontrado' }), { status: 404 });
    }

    return new Response(JSON.stringify(order), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error al obtener estado del pedido:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
  }
}