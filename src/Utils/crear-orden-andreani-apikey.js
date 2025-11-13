// crear-orden-andreani-apikey.js
const axios = require('axios');

async function crearOrden() {
  try {
    console.log('🚀 Iniciando creación de orden de envío en Andreani...\n');

    const url = 'https://apissandbox.andreani.com/beta/transporte-distribucion/ordenes-de-envio';
    const apiKey = process.env.ANDREANI_API_KEY;

    // Validar API KEY
    if (!apiKey) {
      throw new Error('❌ Falta ANDREANI_API_KEY en las variables de entorno');
    }

    console.log('✅ API KEY configurada');
    console.log('📍 URL:', url);
    console.log('');

    // Payload según especificaciones oficiales de Andreani
    // https://developers-sandbox.andreani.com/docs/andreani/beta/creacion-de-una-nueva-orden-de-envio
    const payload = {
      contrato: process.env.ANDREANI_CONTRATO || "400006637",
      tipoDeServicio: process.env.ANDREANI_TIPO_SERVICIO || "estandar",
      idPedido: process.env.ANDREANI_ID_PEDIDO || `TEST-${Date.now()}`,
      origen: {
        postal: {
          codigoPostal: "1878",
          calle: "Roque Saenz Peña",
          numero: "529",
          localidad: "Quilmes",
          region: "AR-B",
          pais: "Argentina",
          componentesDeDireccion: []
        }
      },
      destino: {
        postal: {
          codigoPostal: "1600",
          calle: "Ejemplo",
          numero: "100",
          localidad: "Olivos",
          region: "AR-B",
          pais: "Argentina",
          componentesDeDireccion: []
        }
      },
      remitente: {
        nombreCompleto: "SL Soluciones",
        email: "infostarlinksoluciones@gmail.com",
        documentoTipo: "CUIT",
        documentoNumero: "20312345678",
        telefonos: [{ tipo: 1, numero: "1140000000" }]
      },
      destinatario: [
        {
          nombreCompleto: "Cliente Ejemplo",
          email: "cliente@ejemplo.com",
          documentoTipo: "DNI",
          documentoNumero: "30123456",
          telefonos: [{ tipo: 1, numero: "1155555555" }]
        }
      ],
      bultos: [
        {
          kilos: 1.2,
          largoCm: 20,
          altoCm: 10,
          anchoCm: 15,
          volumenCm: 3000, // largoCm * altoCm * anchoCm
          descripcion: "Dispositivo electrónico",
          valorDeclarado: 15000
        }
      ],
      pagoPendienteEnMostrador: false
    };

    console.log('📦 Payload:');
    console.log(JSON.stringify(payload, null, 2));
    console.log('');

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/plain', // Según documentación
        'Authorization': apiKey  // Formato: <API_KEY_VALUE>
      },
      data: payload
    };

    console.log('🔄 Enviando request...\n');
    const resp = await axios(config);
    
    console.log('✅ Orden creada exitosamente!');
    console.log('📊 Status:', resp.status);
    console.log('📄 Respuesta:');
    console.log(JSON.stringify(resp.data, null, 2));
    console.log('');

    // Extraer número de envío
    if (resp.data.bultos && resp.data.bultos[0]?.numeroDeEnvio) {
      console.log('🏷️  Número de envío:', resp.data.bultos[0].numeroDeEnvio);
    }

  } catch (err) {
    console.error('\n❌ ERROR:\n');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Headers:', err.response.headers);
      console.error('Data:', err.response.data);
    } else if (err.request) {
      console.error('No response received:', err.message);
    } else {
      console.error('Error:', err.message);
    }
    console.error('\n');
  }
}

crearOrden();
