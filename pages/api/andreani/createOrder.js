// pages/api/andreani/createOrder.js
import { createAndreaniOrder } from '../../../lib/andreaniClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  try {
    const { orderId, customer, shipping, items, totals } = req.body;

    if (!orderId || !customer || !shipping || !totals) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos obligatorios: orderId, customer, shipping, totals',
      });
    }

    const andreaniResponse = await createAndreaniOrder({
      orderId,
      customer,
      shipping,
      items: items || [],
      totals,
    });

    return res.status(200).json({
      success: true,
      message: 'Orden de envío creada correctamente en Andreani',
      andreani: andreaniResponse,
    });
  } catch (error) {
    console.error('[API] Error /api/andreani/createOrder:', error.data || error.message);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error interno creando orden en Andreani',
      context: error.data || null,
    });
  }
}
