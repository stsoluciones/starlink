// pages/api/andreani/generar-etiquetas.js
import { connectDB } from '../../../src/lib/mongodb';
import Pedido from '../../../src/models/Order';
import { crearOrdenAndreani } from '../../../src/lib/andreani';
import { downloadEtiquetaPDF } from '../../../src/lib/andreaniClient';

export default async function handler(req, res) {
  console.log('[API Andreani] 🎯 Endpoint generar-etiquetas llamado');
  console.log('[API Andreani] 📨 Método:', req.method);
  
  if (req.method !== 'POST') {
    console.log('[API Andreani] ❌ Método no permitido:', req.method);
    return res
      .status(405)
      .json({ success: false, message: 'Método no permitido. Usar POST.' });
  }

  const { pedidosIds } = req.body;
  console.log('[API Andreani] 📋 IDs recibidos:', pedidosIds);

  if (!Array.isArray(pedidosIds) || pedidosIds.length === 0) {
    console.log('[API Andreani] ⚠️ Array de pedidosIds vacío o inválido');
    return res.status(400).json({
      success: false,
      message: 'Debes enviar un array de pedidosIds.',
    });
  }

  try {
    console.log('[API Andreani] 🔌 Conectando a MongoDB...');
    await connectDB();
    console.log('[API Andreani] ✅ MongoDB conectado');

    console.log('[API Andreani] 🔍 Buscando pedidos en DB...');
    const pedidos = await Pedido.find({ _id: { $in: pedidosIds } });
    console.log('[API Andreani] 📦 Pedidos encontrados:', pedidos.length);

    if (!pedidos.length) {
      console.log('[API Andreani] ❌ No se encontraron pedidos con esos IDs');
      return res.status(404).json({
        success: false,
        message: 'No se encontraron pedidos con esos IDs.',
      });
    }

    let exitosos = 0;
    let fallidos = 0;
    const etiquetas = [];
    const errores = [];
    console.log('[API Andreani] 🔄 Iniciando procesamiento de pedidos...');

    for (let i = 0; i < pedidos.length; i++) {
      const pedido = pedidos[i];
      console.log(`[API Andreani] 📍 Procesando pedido ${i + 1}/${pedidos.length}`);
      console.log(`[API Andreani] 🆔 ID: ${pedido._id}, Número: ${pedido.nroComprobante || pedido._id}`);
      
      try {
        console.log(`[API Andreani] ⏳ Llamando a crearOrdenAndreani...`);
        const respAndreani = await crearOrdenAndreani(pedido);
        console.log(`[API Andreani] ✅ Orden creada exitosamente para pedido ${pedido._id}`);

        // -----------------------------
        //   Extraer tracking + etiqueta
        // -----------------------------
        console.log('[API Andreani] 🔍 Respuesta completa de Andreani:', JSON.stringify(respAndreani, null, 2));
        
        const bultos = respAndreani.bultos || [];
        const primerBulto = bultos[0] || {};

        console.log('[API Andreani] 📦 Primer bulto:', JSON.stringify(primerBulto, null, 2));
        console.log('[API Andreani] 🔗 Linking del bulto:', JSON.stringify(primerBulto.linking, null, 2));

        const trackingCode = primerBulto.numeroDeEnvio || '';

        const etiquetaLinking = (primerBulto.linking || []).find(
          (l) => l.meta === 'Etiqueta'
        );
        const urlEtiquetaBulto = etiquetaLinking?.contenido || null;

        const etiquetaUrl = urlEtiquetaBulto || respAndreani.etiquetaRemito || '';

        console.log('[API Andreani] 📄 Datos de etiqueta extraídos:', {
          pedidoId: pedido._id,
          trackingCode,
          etiquetaUrl,
          etiquetaLinking: etiquetaLinking,
          urlEtiquetaBulto,
          etiquetaRemito: respAndreani.etiquetaRemito,
        });
        
        // -----------------------------
        //   Descargar etiqueta PDF y convertir a base64
        // -----------------------------
        let etiquetaBase64 = null;
        
        if (etiquetaUrl) {
          try {
            console.log('[API Andreani] 📥 Descargando etiqueta PDF...');
            const pdfBuffer = await downloadEtiquetaPDF(etiquetaUrl);
            etiquetaBase64 = pdfBuffer.toString('base64');
            console.log('[API Andreani] ✅ Etiqueta PDF descargada y convertida a base64');
          } catch (errorPDF) {
            console.error('[API Andreani] ⚠️ Error descargando PDF, se guardará solo la URL:', errorPDF.message);
            // Si falla la descarga, guardamos la URL de todas formas
          }
        }
        
        // -----------------------------
        //   Guardar en el pedido (Order)
        // -----------------------------
        pedido.trackingCode = trackingCode;
        // Guardar el PDF en base64 si está disponible, sino la URL
        pedido.etiquetaEnvio = etiquetaUrl;

        // Guardar metadata extra de Andreani
        pedido.metadata = {
          ...(pedido.metadata || {}),
          andreani: {
            ...respAndreani,
            trackingCode,
            etiquetaEnvio: etiquetaUrl,
          },
        };

        console.log('[API Andreani] 💾 Guardando metadata en pedido...');
        await pedido.save();
        console.log('[API Andreani] ✅ Metadata guardada en pedido', pedido._id);

        // -----------------------------
        //   Armar objeto para respuesta
        // -----------------------------
        etiquetas.push({
          pedidoId: String(pedido._id),
          etiquetaInfo: {
            pedidoId: String(pedido._id),
            numeroPedido: String(pedido.nroComprobante || pedido._id),
            trackingCode,
            etiquetaEnvio: etiquetaUrl, // base64 si está disponible, sino URL
            etiquetaUrl: etiquetaUrl, // También incluir la URL por si es útil
            tipoEtiqueta: etiquetaBase64 ? 'base64' : 'url',
          },
        });

        exitosos++;
        console.log(`[API Andreani] 📄 Etiqueta agregada a la respuesta`);
      } catch (e) {
        console.error(
          `[API Andreani] ❌ Error generando etiqueta para pedido ${pedido._id}:`,
          e.data ? JSON.stringify(e.data, null, 2) : e.message,
        );

        const errorInfo = {
          pedidoId: String(pedido._id),
          numeroPedido: String(pedido.nroComprobante || pedido._id),
          error: e.data || e.message || 'Error al crear la orden en Andreani',
        };

        errores.push(errorInfo);
        fallidos++;
        console.log(`[API Andreani] 📝 Error registrado:`, errorInfo);
      }
    }
    
    console.log('[API Andreani] 🏁 Procesamiento completado');
    console.log(`[API Andreani] ✅ Exitosos:`, exitosos);
    console.log(`[API Andreani] ❌ Fallidos:`, fallidos);

    const response = {
      success: exitosos > 0 && fallidos === 0,
      message: `Procesados ${pedidos.length} pedido(s)`,
      etiquetas,
      exitosos,
      fallidos,
      errores,
    };
    
    console.log('[API Andreani] 📤 Enviando respuesta:', JSON.stringify(response, null, 2));

    return res.status(200).json(response);

  } catch (error) {
    console.error('[API Andreani] Error inesperado:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno generando etiquetas',
    });
  }
}
