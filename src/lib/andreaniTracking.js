// src/lib/andreaniTracking.ts
import axios from 'axios';
import { getAndreaniToken } from './andreaniClient';

const ANDREANI_BASE_URL =
  process.env.ANDREANI_API_URL_PRODUCCION || 'https://apis.andreani.com';

export async function getEstadoEnvioAndreani(trackingCode) {
  const token = await getAndreaniToken();

  // ⚠️ TODO: ajustá la URL según la doc de tracking de Andreani
  // Ejemplos típicos:
  //   /v2/envios/{numeroDeEnvio}/tracking
  //   /v1/tracking?numeroDeEnvio=...
  const url = `${ANDREANI_BASE_URL}/v2/envios/${trackingCode}`;

  const resp = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  const data = resp.data;

  // ⚠️ Ajustar a la respuesta real
  const estadoActual = data.estadoActual || data.estado || {};
  const codigo = estadoActual.codigo || null;
  const descripcion = estadoActual.descripcion || codigo || 'DESCONOCIDO';
  const fecha =
    estadoActual.fecha ? new Date(estadoActual.fecha) : new Date();

  return {
    raw: data,
    codigo,
    descripcion,
    fecha,
  };
}
