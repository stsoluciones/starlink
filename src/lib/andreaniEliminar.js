// lib/andreaniEliminar.js
import axios from 'axios';
import { getAndreaniToken } from './andreaniClient';

// 1) Detectar entorno: sandbox o producción
const ANDREANI_ENV =
  process.env.ANDREANI_ENVIRONMENT ||
  (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox');

const ANDREANI_BASE_URL =
  ANDREANI_ENV === 'production'
    ? process.env.ANDREANI_API_URL_PRODUCCION || 'https://apis.andreani.com'
    : process.env.ANDREANI_API_URL_SANDBOX || 'https://apisqa.andreani.com';

/**
 * Cancela uno o varios envíos en Andreani usando la API NuevaAccion.
 *
 * POST {BASE}/v2/api/NuevaAccion
 *
 * Body:
 * {
 *   "accion": "cancelacion",
 *   "datos": {
 *     "contrato": "string",
 *     "numeroAndreani": ["string"],
 *     "componentes": ["string"]
 *   }
 * }
 */
export async function cancelarEnvioAndreani(params = {}) {
  const { numeroAndreani } = params;

  if (!numeroAndreani) {
    throw new Error('❌ cancelarEnvioAndreani: falta numeroAndreani');
  }

  const contrato = process.env.ANDREANI_CONTRATO;

  if (!contrato) {
    throw new Error(
      '❌ cancelarEnvioAndreani: falta ANDREANI_CONTRATO en las variables de entorno'
    );
  }

  // Normalizar a arrays de strings
  const numeroAndreaniArray = Array.isArray(numeroAndreani)
    ? numeroAndreani.map(String)
    : [String(numeroAndreani)];

  const payload = {
    accion: 'cancelacion',
    datos: {
      contrato,
      numeroAndreani: numeroAndreaniArray,
    },
  };

  console.log('[Andreani] 🛑 Enviando solicitud de cancelación...');
  console.log('[Andreani] 🌍 Base URL:', ANDREANI_BASE_URL);
  console.log('[Andreani] 📦 Payload NuevaAccion:', JSON.stringify(payload, null, 2));

  try {
    const token = await getAndreaniToken();
    const url = `${ANDREANI_BASE_URL}/v2/api/NuevaAccion`;

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const data = response.data;

    console.log('[Andreani] ✅ Cancelación ejecutada correctamente');
    console.log('[Andreani] 🔁 Respuesta:', data);

    return data;
  } catch (error) {
    console.error('[Andreani] ❌ Error al cancelar envío');

    if (error.response) {
      console.error('[Andreani] Status:', error.response.status);
      console.error('[Andreani] Data:', error.response.data);
      throw new Error(
        `Error Andreani NuevaAccion: ${error.response.status} - ${JSON.stringify(
          error.response.data
        )}`
      );
    }

    console.error(error);
    throw error;
  }
}
