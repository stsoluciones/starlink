import { getAndreaniToken } from '../../../src/lib/andreaniClient';

export default async function handler(req, res) {
  try {
    const { url, pedidoId } = req.query;

    if (!url) {
      return res.status(400).json({ error: "Falta parámetro 'url'" });
    }

    if (!pedidoId) {
      return res.status(400).json({ error: "Falta 'pedidoId'" });
    }

    // 1) TOKEN CORRECTO (login con user/pass)
    const token = await getAndreaniToken();

    // 2) FETCH a Andreani con Authorization
    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/pdf",
      },
    });

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(500).json({
        error: "Error al obtener etiqueta",
        status: resp.status,
        body: text
      });
    }

    // 3) Convertir PDF
    const buffer = await resp.arrayBuffer();

    // 4) Enviar PDF al navegador
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="etiqueta-${pedidoId}.pdf"`
    );

    return res.send(Buffer.from(buffer));

  } catch (error) {
    console.error("Error obteniendo etiqueta:", error);
    return res.status(500).json({ 
      error: "Error interno",
      detalle: error.message 
    });
  }
}
