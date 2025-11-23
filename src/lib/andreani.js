// lib/andreani.js
import axios from 'axios';
import { createAndreaniOrder } from './andreaniClient';

// Determinar el entorno: sandbox o producción
// Si ANDREANI_ENVIRONMENT está definido, úsalo; si no, usa NODE_ENV
const ANDREANI_ENV = process.env.ANDREANI_ENVIRONMENT || 
  (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox');

const BASE_URL = ANDREANI_ENV === 'production'
  ? process.env.ANDREANI_API_URL_PRODUCCION
  : process.env.ANDREANI_API_URL_SANDBOX;

const API_USER = process.env.ANDREANI_CLIENT_ID;
const API_KEY  = process.env.ANDREANI_CLIENT_SECRET; // lo usamos como token
const CONTRATO = process.env.ANDREANI_CONTRATO;
const TIPO_SERVICIO = process.env.ANDREANI_TIPO_SERVICIO || 'estandar';

// Datos fijos de remitente SL Soluciones
const REMITENTE_NOMBRE   = 'SL soluciones';
const REMITENTE_EMAIL    = 'infostarlinksoluciones@gmail.com';
const REMITENTE_CP      = '1878';
const REMITENTE_CALLE   = 'Roque Saenz Peña';
const REMITENTE_NUMERO  = '529';
const REMITENTE_LOCALID = 'Quilmes';
const REMITENTE_REGION  = 'Buenos Aires';
const REMITENTE_PAIS    = 'Argentina';
const REMITENTE_TEL     = '+541151012478';
const REMITENTE_DOC_TIPO   = 'CUIT';
const REMITENTE_DOC_NUMERO = '20323868906'; // el CUIT de SL soluciones

if (!API_KEY) {
  console.warn('[Andreani] Falta ANDREANI_CLIENT_SECRET (token/JWT)');
}

export function buildAndreaniOrderPayloadFromPedido(pedido) {
  console.log('[Andreani] 🔨 Construyendo payload para pedido:', pedido._id);
  console.log('[Andreani] 📦 Datos del pedido:', {
    numeroPedido: pedido._id,
    usuarioInfo: pedido.usuarioInfo,
    tipoFactura: pedido.tipoFactura,
    direccionEnvio: pedido.direccionEnvio,
    total: pedido.total,
    pesoTotalKg: pedido.pesoTotalKg || 2,
  });

  // Extraer datos del pedido según el esquema correcto
  const nombreCompleto = pedido.usuarioInfo?.nombreCompleto || pedido.tipoFactura?.razonSocial || 'Sin nombre';
  const email = pedido.usuarioInfo?.correo || pedido.tipoFactura?.email || pedido.payerEmail || '';
  const telefono = pedido.direccionEnvio?.telefono || pedido.usuarioInfo?.telefono || pedido.tipoFactura?.telefono || '';
  const documento = pedido.tipoFactura?.cuit ||  pedido.usuarioInfo?.documento || '';
  
  // Datos de dirección
  const direccion = pedido.direccionEnvio || {};

  const pesoKg  = pedido.pesoTotalKg || 2;
  const total   = pedido.total || 0;
  const numeroPedido = String(pedido.numeroPedido || pedido.external_reference || pedido._id);
  const numeroRemito = numeroPedido.slice(0, 30);

  console.log('[Andreani] 📋 Datos extraídos:', {
    nombreCompleto,
    email,
    telefono,
    documento,
    direccion,
  });

  const payload = {
    contrato: CONTRATO,
    tipoDeServicio: TIPO_SERVICIO,
    sucursalClienteID: API_USER,
    idPedido: String(pedido.numeroPedido || pedido.external_reference || pedido._id),

    origen: {
      postal: {
        codigoPostal: REMITENTE_CP,
        calle: REMITENTE_CALLE,
        numero: REMITENTE_NUMERO,
        piso: '',
        departamento: '',
        localidad: REMITENTE_LOCALID,
        region: REMITENTE_REGION,
        pais: REMITENTE_PAIS,
        casillaDeCorreo: '',
        componentesDeDireccion: [],
      },
      // sucursal: {
      //   id: '',
      //   nomenclatura: '',
      //   descripcion: '',
      //   direccion: {
      //     codigoPostal: REMITENTE_CP,
      //     calle: REMITENTE_CALLE,
      //     numero: REMITENTE_NUMERO,
      //     piso: '',
      //     departamento: '',
      //     localidad: REMITENTE_LOCALID,
      //     region: REMITENTE_REGION,
      //     pais: REMITENTE_PAIS,
      //     casillaDeCorreo: '',
      //     componentesDeDireccion: [],
      //   },
      //   telefonos: {
      //     telefono: [
      //       {
      //         tipo: 1, // 1 fijo / 2 celular, etc. Depende doc.
      //         numero: REMITENTE_TEL,
      //       },
      //     ],
      //   },
      //   datosAdicionales: {
      //     matadatos: [],
      //   },
      // },
      coordenadas: {
        elevacion: 0,
        latitud: 0,
        longitud: 0,
        poligono: 0,
      },
    },

    destino: {
      postal: {
        codigoPostal: direccion.codigoPostal || '',
        calle: direccion.calle || '',
        numero: direccion.numero || '',
        piso: direccion.piso || '',
        departamento: direccion.depto || '',
        localidad: direccion.ciudad || '',
        region: direccion.provincia || '',
        pais: direccion.pais || 'Argentina',
        casillaDeCorreo: '',
        componentesDeDireccion: [],
      },
      // sucursal: {
      //   id: '',
      //   nomenclatura: '',
      //   descripcion: '',
      //   direccion: {
      //     codigoPostal: direccion.codigoPostal || '',
      //     calle: direccion.calle || '',
      //     numero: direccion.numero || '',
      //     piso: direccion.piso || '',
      //     departamento: direccion.depto || '',
      //     localidad: direccion.ciudad || '',
      //     region: direccion.provincia || '',
      //     pais: direccion.pais || 'Argentina',
      //     casillaDeCorreo: '',
      //     componentesDeDireccion: [],
      //   },
      //   telefonos: {
      //     telefono: [
      //       {
      //         tipo: 1,
      //         numero: telefono,
      //       },
      //     ],
      //   },
      //   datosAdicionales: {
      //     matadatos: [],
      //   },
      // },
      coordenadas: {
        elevacion: 0,
        latitud: 0,
        longitud: 0,
        poligono: 0,
      },
    },
    idPedido: numeroPedido,
    remitente: {
      nombreCompleto: REMITENTE_NOMBRE,
      email: REMITENTE_EMAIL,
      documentoTipo: REMITENTE_DOC_TIPO,
      documentoNumero: REMITENTE_DOC_NUMERO,
      telefonos: [
        {
          tipo: 1,
          numero: REMITENTE_TEL,
        },
      ],
    },
    destinatario: [
      {
        nombreCompleto,
        email,
        documentoTipo: 'DNI', // o CUIT, lo que corresponda
        documentoNumero: documento,
        telefonos: [
          {
            tipo: 1,
            numero: telefono,
          },
        ],
      },
    ],

    remito: {
      numeroRemito: numeroRemito,
      complementarios: [],
    },

    centroDeCostos: '',
    productoAEntregar: '',
    productoARetirar: '',
    tipoProducto: 'PAQUETE',
    categoriaFacturacion: '',
    pagoDestino: 0,
    valorACobrar: 0,

    fechaDeEntrega: {
      fecha: '',      // si no usás ventana horaria, podés dejar vacío
      horaDesde: '',
      horaHasta: '',
    },

    codigoVerificadorDeEntrega: '',

    bultos: [
      {
        kilos: pesoKg,
        largoCm: 20,
        altoCm: 20,
        anchoCm: 20,
        volumenCm: 20 * 20 * 20,
        valorDeclaradoSinImpuestos: total,
        valorDeclaradoConImpuestos: total,
        referencias: [
          {
            meta: 'idCliente',
            contenido: String(pedido._id),
          },
          {
            meta: 'numeroPedido',
            contenido: numeroPedido,
          },
        ],
        descripcion: 'Mercadería',
        numeroDeEnvio: '',
        valorDeclarado: total,
        componentes: {
          numeroAgrupador: '',
          componentesHijos: [],
        },
        ean: '',
      },
    ],

    pagoPendienteEnMostrador: false,
  };


  console.log('[Andreani] ✅ Payload construido:', JSON.stringify(payload, null, 2));
  return payload;
}



export async function crearOrdenAndreani(pedido) {
  console.log('[Andreani] 🚀 Iniciando creación de orden para pedido:', pedido._id);
  console.log('[Andreani] 🌐 Entorno efectivo:', ANDREANI_ENV);

  const payload = buildAndreaniOrderPayloadFromPedido(pedido);

  try {
    console.log('[Andreani] 📤 Enviando orden a Andreani a través de andreaniClient...');
    const respAndreani = await createAndreaniOrder(payload);
    console.log('[Andreani] ✅ Orden creada correctamente en Andreani');
    return respAndreani;
  } catch (error) {
    console.error('[Andreani] ❌ Error creando orden en Andreani (wrapper crearOrdenAndreani):', error);
    throw error; // lo captura tu API y arma el objeto de error que ya estás logueando
  }
}