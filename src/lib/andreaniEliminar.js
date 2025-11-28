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
  const { numeroAndreani, componentes, contrato: contratoParam } = params;

  if (!numeroAndreani) {
    throw new Error('❌ cancelarEnvioAndreani: falta numeroAndreani');
  }

  const contrato = contratoParam || process.env.ANDREANI_CONTRATO;

  if (!contrato) {
    throw new Error(
      '❌ cancelarEnvioAndreani: falta ANDREANI_CONTRATO en las variables de entorno'
    );
  }

  // Normalizar a arrays de strings
  const numeroAndreaniArray = Array.isArray(numeroAndreani)
    ? numeroAndreani.map(String)
    : [String(numeroAndreani)];

  const componentesArray = componentes
    ? Array.isArray(componentes)
      ? componentes.map(String)
      : [String(componentes)]
    : [];

  const payload = {
    accion: 'cancelacion',
    datos: {
      contrato,
      numeroAndreani: numeroAndreaniArray,
    },
  };

  if (componentesArray.length > 0) {
    payload.datos.componentes = componentesArray;
  }

  console.log('[Andreani] 🛑 Enviando solicitud de cancelación...');
  console.log('[Andreani] 🌍 Base URL:', ANDREANI_BASE_URL);
  console.log('[Andreani] 📦 Payload NuevaAccion:', JSON.stringify(payload, null, 2));

  const url = `${ANDREANI_BASE_URL}/v2/api/NuevaAccion`;
  const apiKey = process.env.ANDREANI_CLIENT_SECRET || '';
  const token = await getAndreaniToken().catch((err) => {
    console.error('[Andreani] ⚠ No se pudo obtener token (puede que no haga falta para este endpoint):', err?.message);
    return null;
  });

  // Headers comunes para todas las variantes
  const baseHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  // Igual que en tu código de etiquetas: armamos las distintas opciones
  const attempts = [];

  if (apiKey) {
    attempts.push({
      label: 'OPCIÓN 1: header "apikey"',
      headers: { apikey: apiKey },
    });

    attempts.push({
      label: 'OPCIÓN 2: header "x-authorization"',
      headers: { 'x-authorization': apiKey },
    });

    attempts.push({
      label: 'OPCIÓN 3: header "Authorization: Apikey"',
      headers: { Authorization: `Apikey ${apiKey}` },
    });
  }

  if (token) {
    attempts.push({
      label: 'OPCIÓN 4: Bearer token',
      headers: { Authorization: `Bearer ${token}` },
    });

    attempts.push({
      label: 'OPCIÓN 5: x-authorization-token',
      headers: { 'x-authorization-token': token },
    });
  }

  if (attempts.length === 0) {
    throw new Error(
      '❌ cancelarEnvioAndreani: no hay ANDREANI_API_KEY ni token disponible para probar autenticación'
    );
  }

  let lastError = null;

  for (const attempt of attempts) {
    console.log(`[Andreani] 🌐 Intentando ${attempt.label}`);

    try {
      const response = await axios.post(url, payload, {
        headers: {
          ...baseHeaders,
          ...attempt.headers,
        },
      });

      console.log(
        `[Andreani] 📡 Respuesta ${attempt.label}:`,
        response.status,
        response.statusText
      );

      if (response.status >= 200 && response.status < 300) {
        console.log(`[Andreani] ✅ ${attempt.label} funcionó`);
        console.log('[Andreani] 🔁 Respuesta:', response.data);
        return response.data;
      }

      // Si no es 2xx, logueamos y probamos la siguiente
      console.warn(
        `[Andreani] ⚠ ${attempt.label} no devolvió 2xx:`,
        response.status,
        response.statusText
      );
      lastError = new Error(
        `Error Andreani NuevaAccion (${attempt.label}): ${response.status} - ${response.statusText}`
      );
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;

        console.error(
          `[Andreani] ❌ ${attempt.label} devolvió error:`,
          status,
          data
        );

        // Guardamos el último error
        lastError = new Error(
          `Error Andreani NuevaAccion (${attempt.label}): ${status} - ${JSON.stringify(
            data
          )}`
        );

        // Si es 401/403 seguimos probando las otras variantes
        if (status === 401 || status === 403) {
          console.warn(
            `[Andreani] ⚠ ${attempt.label} devolvió ${status}, probando siguiente variante...`
          );
          continue;
        }

        // Otros códigos los cortamos directo
        throw lastError;
      } else {
        console.error(`[Andreani] ❌ Error de red en ${attempt.label}:`, error);
        lastError = error;
        // Puede ser un problema de red / DNS / etc → corto
        throw error;
      }
    }
  }

  // Si llegamos acá, ninguna variante funcionó
  console.error('[Andreani] ❌ Ninguna variante de autenticación funcionó en NuevaAccion');
  if (lastError) throw lastError;
  throw new Error('Error Andreani NuevaAccion: no se pudo autenticar con ninguna variante');
}
