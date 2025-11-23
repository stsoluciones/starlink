// lib/andreaniClient.js
import axios from 'axios';

const ANDREANI_ENV =
  process.env.ANDREANI_ENVIRONMENT ||
  (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox');

const ANDREANI_LOGIN_URL = ANDREANI_ENV === 'production'
  ? process.env.ANDREANI_LOGIN_URL_PROD
  : `${process.env.ANDREANI_API_URL_SANDBOX || 'https://apissandbox.andreani.com'}/auth/login`;

const ANDREANI_BASE_URL = ANDREANI_ENV === 'production'
  ? process.env.ANDREANI_API_URL_PRODUCCION
  : process.env.ANDREANI_API_URL_SANDBOX || 'https://apissandbox.andreani.com';

const ANDREANI_CONTRATO = process.env.ANDREANI_CONTRATO;
const ANDREANI_TIPO_SERVICIO = process.env.ANDREANI_TIPO_SERVICIO || 'estandar';
const ANDREANI_USER = process.env.ANDREANI_CLIENT_ID;
const ANDREANI_PASSWORD = process.env.ANDREANI_CLIENT_SECRET;

//Endpoint según docs beta que estás usando
// https://apissandbox.andreani.com/beta/transporte-distribucion/ordenes-de-envio
// Endpoint órdenes por entorno
const ANDREANI_ORDERS_URL =
  ANDREANI_ENV === 'production'
    ? `${ANDREANI_BASE_URL}/v2/ordenes-de-envio`
    : `${ANDREANI_BASE_URL}/beta/transporte-distribucion/ordenes-de-envio`;

if (!ANDREANI_LOGIN_URL || !ANDREANI_USER || !ANDREANI_PASSWORD || !ANDREANI_CONTRATO) {
  console.warn(
    '[Andreani] Faltan variables de entorno: ' +
      'ANDREANI_LOGIN_URL, ANDREANI_USER, ANDREANI_PASSWORD, ANDREANI_CONTRATO',
  );
}

// Cache simple en memoria del token (evita loguearse en cada request)
let cachedToken = null;
let cachedTokenExpiresAt = null;

/**
 * Hace login contra Andreani y devuelve un token JWT.
 * Según doc: Basic Auth (user/pass) -> token.
 */
async function loginAndreani() {
  if (
    cachedToken &&
    cachedTokenExpiresAt &&
    Date.now() < cachedTokenExpiresAt - 60_000 // 1 min de margen
  ) {
    return cachedToken;
  }

  try {
    console.log('[Andreani] 🔐 Login en:', ANDREANI_LOGIN_URL);
    const response = await axios.post(
      ANDREANI_LOGIN_URL,
      {}, // algunas APIs no necesitan body para login con Basic Auth
      {
        auth: {
          username: ANDREANI_USER,
          password: ANDREANI_PASSWORD,
        },
      },
    );

    // ⚠️ Ajustar esto según el JSON real que devuelva Andreani
    // normalmente viene algo tipo { token: "xxx", expires_in: 3600 }
    const { token, expires_in } = response.data;
    
    if (!token) {
      console.error('[Andreani] ❌ Login sin token en respuesta:', response.data);
      throw new Error('Respuesta de login inválida');
    }
    console.log('[Andreani] ✅ Token recibido:', token);

    cachedToken = token;
    cachedTokenExpiresAt = Date.now() + (expires_in || 3600) * 1000;

    return token;
  } catch (error) {
    console.error('[Andreani] Error en login:', error.response?.data || error.message);
    throw new Error('No se pudo autenticar con Andreani');
  }
}

/**
 * Construye el payload de creación de orden según tu pedido de e-commerce.
 *
 * ⚠️ IMPORTANTE:
 * - Acá tenés que usar exactamente los NOMBRES DE CAMPOS que dice la doc:
 *   (contrato, tipoDeServicio, remitente/origen, destinatario/destino, bultos, etc)
 * - Yo te dejo un ejemplo genérico para que vos mapees.
 */
function buildAndreaniOrderPayload({ orderId, customer, shipping, items, totals }) {
  // Ejemplos de datos que *vos* le pasás:
  // orderId: id interno de tu orden
  // customer: { nombre, apellido, documento, email, telefono }
  // shipping: { calle, numero, piso, depto, localidad, provincia, codigoPostal }
  // items: [{ sku, descripcion, cantidad, pesoKg, valorUnitario }]
  // totals: { valorDeclarado, pesoTotalKg }

  return {
    // EJEMPLOS. Cambia estos nombres por los que aparecen en la doc:
    contrato: ANDREANI_CONTRATO,
    tipoDeServicio: ANDREANI_TIPO_SERVICIO,
    idPedido: String(orderId),

    remitente: {
      // tu depósito / origen (según doc)
      // datos fijos de tu comercio (pueden venir de config)
      nombre: 'SL Soluciones ',
      email: 'infostarlinksoluciones@gmail.com',
      // ...
    },

    destinatario: {
      // basados en "customer" y "shipping"
      nombre: `${customer.nombre} ${customer.apellido}`,
      email: customer.email,
      telefono: customer.telefono,
      // campos de domicilio según doc: calle, numero, cp, localidad, provincia, etc.
      domicilio: {
        calle: shipping.calle,
        numero: shipping.numero,
        piso: shipping.piso || '',
        departamento: shipping.depto || '',
        localidad: shipping.localidad,
        provincia: shipping.provincia,
        codigoPostal: shipping.codigoPostal,
      },
      // documento, etc., según doc
      // documento: customer.documento,
    },

    // Bultos, pesos, valores. Ajustá los nombres de acuerdo a la especificación.
    bultos: [
      {
        // acá podés poner un solo bulto con peso total,
        // o dividirlos según tu lógica
        kilos: totals.pesoTotalKg,
        largoCm: 20,
        anchoCm: 20,
        altoCm: 20,
        valorDeclarado: totals.valorDeclarado,
        // referencias internas
        referencias: {
          // nombres de campos reales según doc
          idCliente: String(orderId),
        },
      },
    ],
  };
}

/**
 * Crea la orden de envío en Andreani.
 */
export async function createAndreaniOrder({ orderId, customer, shipping, items, totals }) {
  const token = await loginAndreani();

  const payload = buildAndreaniOrderPayload({ orderId, customer, shipping, items, totals });

  try {
    console.log('[Andreani] 🌐 ENV:', ANDREANI_ENV);
    console.log('[Andreani] 🌐 Base URL:', ANDREANI_BASE_URL);
    console.log('[Andreani] 🌐 Orders URL:', ANDREANI_ORDERS_URL);
    
    const response = await axios.post(ANDREANI_ORDERS_URL, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Devuelvo tal cual la respuesta para que vos veas los campos reales
    return response.data;
  } catch (error) {
    console.error('[Andreani] Error creando orden:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    const data = error.response?.data || null;

    const err = new Error('Error al crear la orden en Andreani');
    err.status = status;
    err.data = data;
    throw err;
  }
}
