//src/lib/andreani.js

/**
 * Obtiene el token de autenticación de Andreani
 * Documentación: https://developers-sandbox.andreani.com/
 */
export async function obtenerTokenAndreani() {
  try {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.ANDREANI_API_URL_PRODUCCION || 'https://api.andreani.com'
      : process.env.ANDREANI_API_URL_SANDBOX || 'https://api.sandbox.andreani.com';
    
    const url = `${baseUrl}/v2/autenticacion/token`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.ANDREANI_CLIENT_ID,
        client_secret: process.env.ANDREANI_CLIENT_SECRET,
        scope: 'andreani-ws',
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error al obtener token de Andreani:', errorText);
      throw new Error(`Error al obtener el token de Andreani: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data.access_token;
  } catch (error) {
    console.error('Error en obtenerTokenAndreani:', error);
    throw error;
  }
}

/**
 * Crea un envío en Andreani y retorna el ID de la orden
 * Documentación: https://developers-sandbox.andreani.com/
 */
export async function crearEnvio(pedido, token) {
  try {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? process.env.ANDREANI_API_URL_PRODUCCION || 'https://api.andreani.com'
      : process.env.ANDREANI_API_URL_SANDBOX || 'https://api.sandbox.andreani.com';
    
    const url = `${baseUrl}/v2/ordenes-de-envio`;

    // Mapear los datos del pedido al formato de Andreani
    const envioData = {
      contrato: process.env.ANDREANI_CLIENT_NUMBER,
      origen: {
        postal: {
          codigoPostal: "1636", // Código postal de tu punto de origen
          calle: "Mitre",
          numero: "1234",
          localidad: "Olivos",
          region: "AR-B", // Provincia (AR-B = Buenos Aires)
          pais: "Argentina",
          componenteDeDireccion: []
        }
      },
      destino: {
        postal: {
          codigoPostal: pedido.direccionEnvio?.codigoPostal || "",
          calle: pedido.direccionEnvio?.calle || "",
          numero: pedido.direccionEnvio?.numero || "S/N",
          piso: pedido.direccionEnvio?.piso || "",
          departamento: pedido.direccionEnvio?.depto || "",
          localidad: pedido.direccionEnvio?.ciudad || "",
          region: `AR-${getCodigoProvincia(pedido.direccionEnvio?.provincia)}`,
          pais: "Argentina",
          componenteDeDireccion: pedido.direccionEnvio?.entreCalles ? [
            { meta: "entreCalle1", contenido: pedido.direccionEnvio.entreCalles }
          ] : []
        }
      },
      destinatario: [
        {
          nombreCompleto: pedido.usuarioInfo?.nombreCompleto || "",
          email: pedido.usuarioInfo?.correo || "",
          documentoTipo: "DNI",
          documentoNumero: pedido.tipoFactura?.cuit?.replace(/\D/g, '') || "",
          telefonos: [
            {
              tipo: 1,
              numero: pedido.usuarioInfo?.telefono || pedido.direccionEnvio?.telefono || ""
            }
          ]
        }
      ],
      remitente: {
        nombreCompleto: "Starlink Soluciones",
        email: process.env.ADMIN_EMAIL || "infostarlinksoluciones@gmail.com",
        documentoTipo: "CUIT",
        documentoNumero: "20123456789", // Reemplaza con tu CUIT
        telefonos: [
          {
            tipo: 1,
            numero: "1140000000" // Reemplaza con tu teléfono
          }
        ]
      },
      productoAEntregar: pedido.items?.map(item => ({
        descripcion: item.nombreProducto || "Producto",
        cantidad: item.cantidad || 1,
      })) || [{ descripcion: "Productos varios", cantidad: 1 }],
      bultos: [
        {
          kilos: calcularPesoTotal(pedido.items) || 1,
          volumenCubico: 0.001, // 1000 cm³ (mínimo)
          valorDeclarado: pedido.total || 0,
          contenido: "Productos de tecnología"
        }
      ],
      numeroDeTransaccion: pedido._id.toString(),
      referencia: `PEDIDO-${pedido._id.toString().slice(-6)}`,
    };

    console.log('Enviando datos a Andreani:', JSON.stringify(envioData, null, 2));

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-authorization-token': token,
      },
      body: JSON.stringify(envioData),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error de Andreani al crear envío:', errorText);
      throw new Error(`No se pudo generar el envío: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log('Respuesta de Andreani:', data);
    return data; // Retorna { numeroDeEnvio, bultos: [{ id }] }
  } catch (error) {
    console.error('Error en crearEnvio:', error);
    throw error;
  }
}

/**
 * Obtiene la etiqueta PDF de un envío
 * Documentación: https://developers-sandbox.andreani.com/
 */
export async function obtenerEtiquetaPDF(numeroDeEnvio, token) {
  try {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? process.env.ANDREANI_API_URL_PRODUCCION || 'https://api.andreani.com'
      : process.env.ANDREANI_API_URL_SANDBOX || 'https://api.sandbox.andreani.com';
    
    const url = `${baseUrl}/v2/ordenes-de-envio/${numeroDeEnvio}/etiquetas`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/pdf',
        'x-authorization-token': token,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error al obtener etiqueta:', errorText);
      throw new Error(`No se pudo obtener la etiqueta: ${res.status} ${res.statusText}`);
    }

    return await res.arrayBuffer(); // PDF como binary
  } catch (error) {
    console.error('Error en obtenerEtiquetaPDF:', error);
    throw error;
  }
}

/**
 * Consulta el estado de un envío
 */
export async function consultarEstadoEnvio(numeroDeEnvio, token) {
  try {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? process.env.ANDREANI_API_URL_PRODUCCION || 'https://api.andreani.com'
      : process.env.ANDREANI_API_URL_SANDBOX || 'https://api.sandbox.andreani.com';
    
    const url = `${baseUrl}/v2/envios/${numeroDeEnvio}/trazas`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-authorization-token': token,
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
