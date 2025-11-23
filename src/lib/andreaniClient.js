// lib/andreaniClient.js
import axios from 'axios';

// 1) Detectar entorno: sandbox o producción
const ANDREANI_ENV =
  process.env.ANDREANI_ENVIRONMENT ||
  (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox');

// 2) URLs base por entorno
const ANDREANI_BASE_URL =
  ANDREANI_ENV === 'production'
    // PROD → host oficial v2
    ? (process.env.ANDREANI_API_URL_PRODUCCION || 'https://apis.andreani.com')
    // SANDBOX → host sandbox/beta
    : (process.env.ANDREANI_API_URL_SANDBOX || 'https://apissandbox.andreani.com');

// 3) URL de LOGIN por entorno
//    Si tenés paths específicos, los ponés en las envs;
//    si no, por defecto uso `${BASE_URL}/auth/login`
const ANDREANI_LOGIN_URL =
  ANDREANI_ENV === 'production'
    ? (process.env.ANDREANI_LOGIN_URL_PROD || `${ANDREANI_BASE_URL}/auth/login`)
    : (process.env.ANDREANI_LOGIN_URL_SANDBOX || `${ANDREANI_BASE_URL}/auth/login`);

// 4) Endpoint de órdenes por entorno
//    - Sandbox: beta/transporte-distribucion/ordenes-de-envio
//    - Prod:    v2/ordenes-de-envio
const ANDREANI_ORDERS_URL =
  ANDREANI_ENV === 'production'
    ? `${ANDREANI_BASE_URL}/v2/ordenes-de-envio`
    : `${ANDREANI_BASE_URL}/beta/transporte-distribucion/ordenes-de-envio`;

// 5) Credenciales y datos fijos
const ANDREANI_CONTRATO       = process.env.ANDREANI_CONTRATO;
const ANDREANI_TIPO_SERVICIO  = process.env.ANDREANI_TIPO_SERVICIO || 'estandar';
const ANDREANI_USER           = process.env.ANDREANI_CLIENT_ID;
const ANDREANI_PASSWORD       = process.env.ANDREANI_CLIENT_SECRET;

if (!ANDREANI_USER || !ANDREANI_PASSWORD || !ANDREANI_CONTRATO) {
  console.warn(
    '[Andreani] ⚠️ Faltan variables de entorno obligatorias: ' +
      'ANDREANI_CLIENT_ID, ANDREANI_CLIENT_SECRET, ANDREANI_CONTRATO',
  );
}

if (!ANDREANI_LOGIN_URL) {
  console.warn('[Andreani] ⚠️ Falta ANDREANI_LOGIN_URL_PROD / ANDREANI_LOGIN_URL_SANDBOX, usando fallback /auth/login');
}

// 6) Cache simple del token en memoria
let cachedToken = null;
let cachedTokenExpiresAt = null;

/**
 * Hace login contra Andreani y devuelve un token de acceso.
 * En ambos entornos:
 *   POST ANDREANI_LOGIN_URL
 *   Auth Basic: ANDREANI_USER / ANDREANI_PASSWORD
 */
async function loginAndreani() {
  // Reutilizar token si sigue vigente (con 1 min de margen)
  if (
    cachedToken &&
    cachedTokenExpiresAt &&
    Date.now() < cachedTokenExpiresAt - 60_000
  ) {
    return cachedToken;
  }

  try {
    console.log('[Andreani] 🔐 Login en:', ANDREANI_LOGIN_URL);
    const response = await axios.post(
      ANDREANI_LOGIN_URL,
      {}, // muchas APIs de login con Basic Auth no requieren body
      {
        auth: {
          username: ANDREANI_USER,
          password: ANDREANI_PASSWORD,
        },
      },
    );

    // ⚠️ Ajustar según la respuesta REAL de Andreani
    // Ejemplos típicos:
    //  - { token: "xxx", expires_in: 3600 }
    //  - { access_token: "xxx", expires_in: 3600 }
    const { token, access_token, expires_in } = response.data;

    const finalToken = token || access_token;

    if (!finalToken) {
      console.error('[Andreani] ❌ Login sin token en respuesta:', response.data);
      throw new Error('Respuesta de login inválida: no se encontró token');
    }

    console.log('[Andreani] ✅ Token recibido (oculto por seguridad)');
    cachedToken = finalToken;
    cachedTokenExpiresAt = Date.now() + (expires_in || 3600) * 1000;

    return finalToken;
  } catch (error) {
    console.error('[Andreani] ❌ Error en login:', error.response?.data || error.message);
    throw new Error('No se pudo autenticar con Andreani');
  }
}

/**
 * Construye el payload de creación de orden según tu pedido de e-commerce.
 *
 * ⚠️ IMPORTANTE:
 * - Ajustá los nombres de los campos a lo que pide la doc oficial de Andreani.
 */
function buildAndreaniOrderPayload({ orderId, customer, shipping, items, totals }) {
  return {
    contrato: ANDREANI_CONTRATO,
    tipoDeServicio: ANDREANI_TIPO_SERVICIO,
    idPedido: String(orderId),

    // Puedes extender esto con origen/destino completos según la doc v2
    remitente: {
      nombre: 'SL Soluciones',
      email: 'infostarlinksoluciones@gmail.com',
      // completar si la doc pide más datos (domicilio, documento, etc.)
    },

    destinatario: {
      nombre: `${customer.nombre} ${customer.apellido}`,
      email: customer.email,
      telefono: customer.telefono,
      domicilio: {
        calle: shipping.calle,
        numero: shipping.numero,
        piso: shipping.piso || '',
        departamento: shipping.depto || '',
        localidad: shipping.localidad,
        provincia: shipping.provincia,
        codigoPostal: shipping.codigoPostal,
      },
      // documento: customer.documento, // si la doc lo pide
    },

    bultos: [
      {
        kilos: totals.pesoTotalKg,
        largoCm: 20,
        anchoCm: 20,
        altoCm: 20,
        valorDeclarado: totals.valorDeclarado,
        referencias: {
          idCliente: String(orderId),
        },
      },
    ],
  };
}

/**
 * Crea la orden de envío en Andreani (sandbox o producción según ANDREANI_ENVIRONMENT).
 */
export async function createAndreaniOrder({ orderId, customer, shipping, items, totals }) {
  const token = await loginAndreani();
  const payload = buildAndreaniOrderPayload({ orderId, customer, shipping, items, totals });

  try {
    console.log('[Andreani] 🌐 ENV:', ANDREANI_ENV);
    console.log('[Andreani] 🌐 Base URL:', ANDREANI_BASE_URL);
    console.log('[Andreani] 🌐 Orders URL:', ANDREANI_ORDERS_URL);

    // Header de autenticación.
    // Si tu doc dice explícitamente "Authorization: Bearer {token}", dejá esto así.
    // Si en cambio pide "x-authorization-token: {token}", cambialo abajo.
    const headers = {
      'Content-Type': 'application/json',
      // Opción A (la más común):
      Authorization: `Bearer ${token}`,
      // Opción B (si doc dice x-authorization-token):
      // 'x-authorization-token': token,
    };

    const response = await axios.post(ANDREANI_ORDERS_URL, payload, { headers });

    console.log('[Andreani] ✅ Orden creada, status:', response.status);
    return response.data;
  } catch (error) {
    console.error('[Andreani] ❌ Error creando orden:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data || error.message);

    const status = error.response?.status || 500;
    const data = error.response?.data || null;

    const err = new Error('Error al crear la orden en Andreani');
    err.status = status;
    err.data = data;
    throw err;
  }
}
