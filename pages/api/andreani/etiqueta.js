import { getAndreaniToken } from '../../../src/lib/andreaniClient';

export default async function handler(req, res) {
  try {
    const { url, pedidoId } = req.query;

    console.log('[ETIQUETA] 📋 Solicitud recibida:', { url, pedidoId });

    if (!url) {
      return res.status(400).json({ error: "Falta parámetro 'url'" });
    }

    if (!pedidoId) {
      return res.status(400).json({ error: "Falta 'pedidoId'" });
    }

    // 1) TOKEN CORRECTO (login con user/pass)
    console.log('[ETIQUETA] 🔑 Obteniendo token de Andreani...');
    const token = await getAndreaniToken();
    console.log('[ETIQUETA] ✅ Token obtenido:', token ? 'OK' : 'NO');

    // 2) FETCH a Andreani con Authorization
    console.log('[ETIQUETA] 🌐 Intentando OPCIÓN 1: header "apikey"');
    let resp = await fetch(url, {
    headers: {
        apikey: process.env.ANDREANI_API_KEY,
        Accept: "application/pdf",
    },
    });
    console.log('[ETIQUETA] 📡 Respuesta OPCIÓN 1:', resp.status, resp.statusText);
    
    if (resp.status === 200) {
        console.log('[ETIQUETA] ✅ OPCIÓN 1 funcionó: header "apikey"');
    }

    // 2) Si falla, intento variante 2
    if (resp.status === 401) {
        console.log('[ETIQUETA] 🌐 Intentando OPCIÓN 2: header "x-authorization"');
        resp = await fetch(url, {
            headers: {
            "x-authorization": process.env.ANDREANI_API_KEY,
            Accept: "application/pdf",
            },
        });
        console.log('[ETIQUETA] 📡 Respuesta OPCIÓN 2:', resp.status, resp.statusText);
    }
    if (resp.status === 200) {
        console.log('[ETIQUETA] ✅ OPCIÓN 2 funcionó: header "x-authorization"');
    }
    
    // 3) Variante 3
    if (resp.status === 401) {
        console.log('[ETIQUETA] 🌐 Intentando OPCIÓN 3: header "Authorization: Apikey"');
        resp = await fetch(url, {
            headers: {
            Authorization: `Apikey ${process.env.ANDREANI_API_KEY}`,
            Accept: "application/pdf",
            },
        });
        console.log('[ETIQUETA] 📡 Respuesta OPCIÓN 3:', resp.status, resp.statusText);
    }
    if (resp.status === 200) {
        console.log('[ETIQUETA] ✅ OPCIÓN 3 funcionó: header "Authorization: Apikey"');
    }
    
    // 4) Intentar con Bearer token
    if (resp.status === 401 && token) {
        console.log('[ETIQUETA] 🌐 Intentando OPCIÓN 4: Bearer token');
        resp = await fetch(url, {
            headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/pdf",
            },
        });
        console.log('[ETIQUETA] 📡 Respuesta OPCIÓN 4:', resp.status, resp.statusText);
        if (resp.status === 200) {
            console.log('[ETIQUETA] ✅ OPCIÓN 4 funcionó: Bearer token');
        }
    }
    
    // 5) Intentar con x-authorization-token (como en andreaniClient)
    if (resp.status === 401 && token) {
        console.log('[ETIQUETA] 🌐 Intentando OPCIÓN 5: x-authorization-token');
        resp = await fetch(url, {
            headers: {
            "x-authorization-token": token,
            Accept: "application/pdf",
            },
        });
        console.log('[ETIQUETA] 📡 Respuesta OPCIÓN 5:', resp.status, resp.statusText);
        if (resp.status === 200) {
            console.log('[ETIQUETA] ✅ OPCIÓN 5 funcionó: x-authorization-token');
        }
    }

    if (!resp.ok) {
      console.error('[ETIQUETA] ❌ Error final al obtener etiqueta');
      console.error('[ETIQUETA] Status:', resp.status);
      console.error('[ETIQUETA] URL intentada:', url);
      const text = await resp.text();
      console.error('[ETIQUETA] Respuesta:', text);
      
      return res.status(500).json({
        error: "Error al obtener etiqueta - Todas las opciones de autenticación fallaron",
        status: resp.status,
        body: text,
        url: url
      });
    }

    // 3) Convertir PDF
    console.log('[ETIQUETA] 📄 Convirtiendo PDF a buffer...');
    const buffer = await resp.arrayBuffer();
    console.log('[ETIQUETA] ✅ PDF obtenido, tamaño:', buffer.byteLength, 'bytes');

    // 4) Enviar PDF al navegador
    console.log('[ETIQUETA] 📤 Enviando PDF al navegador...');
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="etiqueta-${pedidoId}.pdf"`
    );

    console.log('[ETIQUETA] ✅ Etiqueta enviada exitosamente para pedido:', pedidoId);
    return res.send(Buffer.from(buffer));

  } catch (error) {
    console.error("[ETIQUETA] ❌ Error inesperado obteniendo etiqueta:", error);
    console.error("[ETIQUETA] Stack:", error.stack);
    return res.status(500).json({ 
      error: "Error interno",
      detalle: error.message 
    });
  }
}
