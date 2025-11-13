//src/lib/andreani.js

/**
 * Valida que exista la API KEY de Andreani
 * Documentación: https://developers-sandbox.andreani.com/
 */
export function obtenerApiKeyAndreani() {
  const apiKey = process.env.ANDREANI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Falta ANDREANI_API_KEY en las variables de entorno');
  }
  
  console.log('API KEY de Andreani configurada correctamente');
  return apiKey;
}

/**
 * [OBSOLETA] Función antigua para OAuth - ahora se usa APIKEY
 * Se mantiene por compatibilidad pero siempre devuelve la APIKEY
 */
export async function obtenerTokenAndreani() {
  // Ahora retornamos la APIKEY directamente en lugar de hacer OAuth
  return obtenerApiKeyAndreani();
}


/**
 * Crea un envío en Andreani y retorna el ID de la orden
 * Documentación: https://developers-sandbox.andreani.com/docs/andreani/beta/creacion-de-una-nueva-orden-de-envio
 */
export async function crearEnvio(pedido, apiKey) {
  try {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? process.env.ANDREANI_API_URL_PRODUCCION || 'https://api.andreani.com'
      : process.env.ANDREANI_API_URL_SANDBOX || 'https://apissandbox.andreani.com';

    const url = `${baseUrl}/beta/transporte-distribucion/ordenes-de-envio`;

    // Validar datos requeridos del destinatario
    const nombreCompleto = pedido.usuarioInfo?.nombreCompleto || pedido.direccionEnvio?.nombreCompleto || "";
    const email = pedido.usuarioInfo?.correo || pedido.usuarioInfo?.email || "";
    const telefono = pedido.usuarioInfo?.telefono || pedido.direccionEnvio?.telefono || "";
    
    if (!nombreCompleto || !email || !telefono) {
      throw new Error('Faltan datos del destinatario (nombre, email o teléfono)');
    }

    // Validar dirección de destino
    if (!pedido.direccionEnvio?.codigoPostal || !pedido.direccionEnvio?.calle || !pedido.direccionEnvio?.ciudad) {
      throw new Error('Faltan datos de la dirección de envío (código postal, calle o ciudad)');
    }

    // Mapear los datos del pedido al formato EXACTO de la API de Andreani
    const envioData = {
      contrato: process.env.ANDREANI_CONTRATO || "400006637",
      tipoDeServicio: process.env.ANDREANI_TIPO_SERVICIO || "estandar",
      idPedido: pedido._id?.toString() || "",
      origen: {
        postal: {
          codigoPostal: process.env.ANDREANI_ORIGEN_CP || "1878",
          calle: process.env.ANDREANI_ORIGEN_CALLE || "Roque Saenz Peña",
          numero: process.env.ANDREANI_ORIGEN_NUMERO || "529",
          localidad: process.env.ANDREANI_ORIGEN_LOCALIDAD || "Quilmes",
          region: process.env.ANDREANI_ORIGEN_REGION || "AR-B",
          pais: "Argentina",
          componentesDeDireccion: []
        }
      },
      destino: {
        postal: {
          codigoPostal: pedido.direccionEnvio.codigoPostal,
          calle: pedido.direccionEnvio.calle,
          numero: pedido.direccionEnvio.numero || "S/N",
          piso: pedido.direccionEnvio.piso || "",
          departamento: pedido.direccionEnvio.depto || pedido.direccionEnvio.departamento || "",
          localidad: pedido.direccionEnvio.ciudad,
          region: `AR-${getCodigoProvincia(pedido.direccionEnvio.provincia)}`,
          pais: "Argentina",
          componentesDeDireccion: pedido.direccionEnvio.entreCalles ? [
            {
              meta: "entreCalle1",
              contenido: pedido.direccionEnvio.entreCalles
            }
          ] : []
        }
      },
      remitente: {
        nombreCompleto: process.env.ANDREANI_REMITENTE_NOMBRE || "SL Soluciones",
        email: process.env.ANDREANI_REMITENTE_EMAIL || "infostarlinksoluciones@gmail.com",
        documentoTipo: "CUIT",
        documentoNumero: process.env.ANDREANI_REMITENTE_CUIT || "20312345678",
        telefonos: [
          { 
            tipo: 1, 
            numero: process.env.ANDREANI_REMITENTE_TEL || "1140000000" 
          }
        ]
      },
      destinatario: [
        {
          nombreCompleto: nombreCompleto,
          email: email,
          documentoTipo: "DNI",
          documentoNumero: (pedido.tipoFactura?.cuit || pedido.usuarioInfo?.dni || "30123456").replace(/\D/g, ''),
          telefonos: [
            {
              tipo: 1,
              numero: telefono.replace(/\D/g, '')
            }
          ]
        }
      ],
      bultos: [
        {
          kilos: calcularPesoTotal(pedido.items),
          largoCm: 20,
          altoCm: 10,
          anchoCm: 15,
          volumenCm: 3000, // largoCm * altoCm * anchoCm
          valorDeclarado: Math.round(pedido.total || 0),
          descripcion: pedido.items?.map(i => i.nombreProducto).slice(0, 3).join(', ') || "Productos varios"
        }
      ],
      pagoPendienteEnMostrador: false
    };

    console.log('📦 Creando orden en Andreani...');
    console.log('URL:', url);
    console.log('Payload:', JSON.stringify(envioData, null, 2));

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/plain', // La documentación sugiere text/plain
        'Authorization': apiKey // Según la doc: 'Authorization: <API_KEY_VALUE>'
      },
      body: JSON.stringify(envioData)
    });

    const responseText = await res.text();
    console.log('📨 Respuesta status:', res.status);
    console.log('📨 Respuesta body:', responseText);

    if (!res.ok) {
      console.error('❌ Error de Andreani:', res.status, responseText);
      throw new Error(`Error ${res.status}: ${responseText}`);
    }

    // Intentar parsear la respuesta como JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      // Si no es JSON, usar el texto plano
      data = { numeroDeEnvio: responseText, rawResponse: responseText };
    }

    console.log('✅ Orden creada exitosamente:', data);
    return data;
  } catch (error) {
    console.error('❌ Error en crearEnvio:', error.message);
    throw error;
  }
}

/**
 * Obtiene la etiqueta PDF de un envío
 * Documentación: https://developers-sandbox.andreani.com/
 */
export async function obtenerEtiquetaPDF(numeroDeEnvio, apiKey) {
  try {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? process.env.ANDREANI_API_URL_PRODUCCION || 'https://api.andreani.com'
      : process.env.ANDREANI_API_URL_SANDBOX || 'https://apissandbox.andreani.com';

    // Usar el número de envío correcto (puede venir en bultos[0].numeroDeEnvio)
    const numeroLimpio = numeroDeEnvio?.trim();
    if (!numeroLimpio) {
      throw new Error('Número de envío inválido o vacío');
    }

    const url = `${baseUrl}/beta/transporte-distribucion/ordenes-de-envio/${numeroLimpio}/etiquetas`;
    console.log('📄 Obteniendo etiqueta desde:', url);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': apiKey, // Según doc: 'Authorization: <API_KEY_VALUE>'
        'Accept': 'application/pdf'
      },
    });

    console.log('📄 Respuesta etiqueta status:', res.status);
    console.log('📄 Content-Type:', res.headers.get('content-type'));

    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Error al obtener etiqueta:', res.status, errorText);
      throw new Error(`No se pudo obtener la etiqueta (${res.status}): ${errorText}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    console.log('✅ Etiqueta PDF obtenida:', arrayBuffer.byteLength, 'bytes');
    
    return arrayBuffer;
  } catch (error) {
    console.error('❌ Error en obtenerEtiquetaPDF:', error.message);
    throw error;
  }
}

/**
 * Consulta el estado de un envío
 */
export async function consultarEstadoEnvio(numeroDeEnvio, apiKey) {
  try {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? process.env.ANDREANI_API_URL_PRODUCCION || 'https://api.andreani.com'
      : process.env.ANDREANI_API_URL_SANDBOX || 'https://apissandbox.andreani.com';
    
    const url = `${baseUrl}/beta/transporte-distribucion/ordenes-de-envio/${numeroDeEnvio}/trazas`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `APIKEY ${apiKey}`,
        'Accept': 'application/json'
      },
    });

    if (!res.ok) {
      throw new Error(`No se pudo consultar el estado: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error en consultarEstadoEnvio:', error);
    throw error;
  }
}

// Funciones auxiliares
function getCodigoProvincia(nombreProvincia) {
  const provincias = {
    'Buenos Aires': 'B',
    'CABA': 'C',
    'Ciudad Autónoma de Buenos Aires': 'C',
    'Catamarca': 'K',
    'Chaco': 'H',
    'Chubut': 'U',
    'Córdoba': 'X',
    'Corrientes': 'W',
    'Entre Ríos': 'E',
    'Formosa': 'P',
    'Jujuy': 'Y',
    'La Pampa': 'L',
    'La Rioja': 'F',
    'Mendoza': 'M',
    'Misiones': 'N',
    'Neuquén': 'Q',
    'Río Negro': 'R',
    'Salta': 'A',
    'San Juan': 'J',
    'San Luis': 'D',
    'Santa Cruz': 'Z',
    'Santa Fe': 'S',
    'Santiago del Estero': 'G',
    'Tierra del Fuego': 'V',
    'Tucumán': 'T',
  };
  
  return provincias[nombreProvincia] || 'B'; // Default Buenos Aires
}

function calcularPesoTotal(items) {
  if (!items || items.length === 0) return 1;
  // Asume peso promedio de 1kg por producto
  const totalItems = items.reduce((acc, item) => acc + (item.cantidad || 1), 0);
  return Math.max(totalItems * 1, 0.5); // Mínimo 0.5kg
}
