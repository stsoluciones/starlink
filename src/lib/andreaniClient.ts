// lib/andreaniClient.js
import axios from 'axios';

// 1) Detectar entorno: sandbox o producción
const ANDREANI_ENV =
  process.env.ANDREANI_ENVIRONMENT ||
  (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox');

// 2) URLs base por entorno
const ANDREANI_BASE_URL =
  ANDREANI_ENV === 'production'
    ? (process.env.ANDREANI_API_URL_PRODUCCION || 'https://apis.andreani.com')
    : (process.env.ANDREANI_API_URL_SANDBOX || 'https://apisqa.andreani.com');

// 3) URL de LOGIN por entorno
//    En prod te pasaron: https://apis.andreani.com/login
//    En QA suele ser:    https://apisqa.andreani.com/login
const ANDREANI_LOGIN_URL =
  ANDREANI_ENV === 'production'
    ? (process.env.ANDREANI_LOGIN_URL_PROD || `${ANDREANI_BASE_URL}/login`)
    : (process.env.ANDREANI_LOGIN_URL_SANDBOX || `${ANDREANI_BASE_URL}/login`);

// 4) Endpoint de órdenes por entorno
//    - Sandbox: beta/transporte-distribucion/ordenes-de-envio
//    - Prod:    v2/ordenes-de-envio
const ANDREANI_ORDERS_URL =
  ANDREANI_ENV === 'production'
    ? `${ANDREANI_BASE_URL}/v2/ordenes-de-envio`
    : `${ANDREANI_BASE_URL}/beta/transporte-distribucion/ordenes-de-envio`;

// 5) Credenciales (usuario / contraseña para el login)
const ANDREANI_USER      = process.env.ANDREANI_CLIENT_ID;
const ANDREANI_PASSWORD  = process.env.ANDREANI_CLIENT_SECRET; // acá actúa como "password" para el login

if (!ANDREANI_USER || !ANDREANI_PASSWORD) {
  console.warn(
    '[Andreani] ⚠️ Faltan variables de entorno obligatorias: ANDREANI_CLIENT_ID y/o ANDREANI_CLIENT_SECRET'
  );
}

if (!ANDREANI_LOGIN_URL) {
  console.warn(
    '[Andreani] ⚠️ Falta ANDREANI_LOGIN_URL_PROD / ANDREANI_LOGIN_URL_SANDBOX, usando fallback /login'
  );
}

// 6) Cache simple del token en memoria
let cachedToken: string | null = null;
let cachedTokenExpiresAt: number | null = null;

/**
 * Hace login contra Andreani y devuelve un token de acceso.
 * En ambos entornos:
 *   POST ANDREANI_LOGIN_URL
 *   Auth Basic: ANDREANI_USER / ANDREANI_PASSWORD
 */
export async function loginAndreani(): Promise<string> {
  // Reutilizar token si sigue vigente (con 1 min de margen)
  if (
    cachedToken &&
    cachedTokenExpiresAt &&
    Date.now() < cachedTokenExpiresAt - 60_000
  ) {
    console.log('[Andreani] 🔄 Reutilizando token cacheado');
    return cachedToken;
  }

  try {
    console.log('[Andreani] 🔐 Haciendo login en:', ANDREANI_LOGIN_URL);
    console.log('[Andreani] 🌐 ENV:', ANDREANI_ENV);
    console.log('[Andreani] 👤 Usuario (CLIENT_ID):', ANDREANI_USER);

    const response = await axios.post(
      ANDREANI_LOGIN_URL,
      {}, // muchas APIs de login con Basic Auth no requieren body
      {
        auth: {
          username: ANDREANI_USER!,
          password: ANDREANI_PASSWORD!,
        },
      }
    );

    // ⚠️ Ajustar según la respuesta REAL de Andreani
    // Casos típicos:
    //  - { token: "xxx", expires_in: 3600 }
    //  - { access_token: "xxx", expires_in: 3600 }
    const { token, access_token, expires_in } = response.data || {};

    const finalToken: string | undefined = token || access_token;

    if (!finalToken) {
      console.error('[Andreani] ❌ Login sin token en respuesta:', response.data);
      throw new Error('Respuesta de login inválida: no se encontró token');
    }

    console.log('[Andreani] ✅ Token recibido (oculto por seguridad)');
    cachedToken = finalToken;
    cachedTokenExpiresAt = Date.now() + (expires_in || 3600) * 1000;

    return finalToken;
  } catch (error: any) {
    console.error(
      '[Andreani] ❌ Error en login:',
      error.response?.data || error.message
    );
    throw new Error('No se pudo autenticar con Andreani');
  }
}

/**
 * Helper por si querés un nombre más semántico desde otros módulos.
 */
export async function getAndreaniToken(): Promise<string> {
  return loginAndreani();
}

/**
 * Crea la orden de envío EN ANDREANI usando un payload YA ARMADO
 * (por ejemplo, el que generás en buildAndreaniOrderPayloadFromPedido en lib/andreani.js).
 *
 * Ejemplo de uso desde lib/andreani.js:
 *
 *   import { createAndreaniOrder } from './andreaniClient';
 *
 *   const payload = buildAndreaniOrderPayloadFromPedido(pedido);
 *   const respAndreani = await createAndreaniOrder(payload);
 */
export async function createAndreaniOrder(payload: any): Promise<any> {
  const token = await loginAndreani();

  try {
    console.log('[Andreani] 🌐 ENV:', ANDREANI_ENV);
    console.log('[Andreani] 🌐 Base URL:', ANDREANI_BASE_URL);
    console.log('[Andreani] 🌐 Orders URL:', ANDREANI_ORDERS_URL);

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // Según la doc genérica de Andreani, se usa x-authorization-token
      'x-authorization-token': token,
      // Si en tu doc particular dijera explícitamente "Authorization: Bearer {token}",
      // podrías cambiarlo por:
      // Authorization: `Bearer ${token}`,
    };

    console.log('[Andreani] 📤 Enviando orden a Andreani...');
    const response = await axios.post(ANDREANI_ORDERS_URL, payload, {
      headers,
      maxBodyLength: Infinity,
    });

    console.log('[Andreani] ✅ Orden creada, status:', response.status);
    console.log('[Andreani] 📥 Respuesta Andreani:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error: any) {
    console.error('[Andreani] ❌ Error creando orden en Andreani:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data || error.message);

    const err = new Error('Error al crear la orden en Andreani');
    (err as any).status = error.response?.status || 500;
    (err as any).data = error.response?.data || null;
    throw err;
  }
}
