// pages/api/andreani/sync-estados.js
import { connectDB } from '../../../src/lib/mongodb';
import Pedido from '../../../src/models/Order';
import { getEstadoAndreani } from '../../../src/lib/andreaniTracking';

export default async function handler(req, res) {
  console.log('[API Andreani] 🎯 Endpoint sync-estados llamado');
  console.log('[API Andreani] 📨 Método:', req.method);

  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, message: 'Método no permitido. Usar POST.' });
  }

  try {
    await connectDB();
    console.log('[API Andreani] ✅ MongoDB conectado');

    // Buscar pedidos enviados pero no entregados
    const pedidos = await Pedido.find({
      estado: 'enviado',
      trackingCode: { $ne: null },
    });

    console.log('[API Andreani] 🔍 Pedidos a sincronizar:', pedidos.length);

    let actualizados = 0;
    const detalles = [];

    for (const pedido of pedidos) {
      try {
        console.log(`[API Andreani] 🚚 Consultando estado para tracking ${pedido.trackingCode} (pedido ${pedido._id})`);

        const estadoAndreani = await getEstadoAndreani(pedido.trackingCode);
        console.log('[API Andreani] 📦 Estado recibido:', estadoAndreani);

        // Guardar estado + última actualización
        pedido.andreaniEstado = estadoAndreani.estado;
        pedido.andreaniUltimaActualizacion = new Date();

        // Si Andreani dice que está entregado → marcamos pedido como entregado
        const esEntregado = /entregado/i.test(estadoAndreani.estado) || estadoAndreani.codigo === 'ENTREGADO';

        if (esEntregado) {
          pedido.estado = 'entregado';
          pedido.fechaEntregado = estadoAndreani.fechaEvento || new Date();
          actualizados++;
          console.log(`[API Andreani] ✅ Pedido ${pedido._id} marcado como ENTREGADO`);
        }

        await pedido.save();

        detalles.push({
          pedidoId: String(pedido._id),
          trackingCode: pedido.trackingCode,
          andreaniEstado: estadoAndreani.estado,
          codigo: estadoAndreani.codigo,
          marcadoEntregado: esEntregado,
        });
      } catch (err) {
        console.error(`[API Andreani] ❌ Error consultando estado para pedido ${pedido._id}:`, err.message);
        detalles.push({
          pedidoId: String(pedido._id),
          trackingCode: pedido.trackingCode,
          error: err.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Sincronizados ${pedidos.length} pedido(s). Marcados como entregados: ${actualizados}.`,
      detalles,
    });
  } catch (error) {
    console.error('[API Andreani] ❌ Error general en sync-estados:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno en sync-estados',
    });
  }
}
