//app/lib/andreani.js

async function crearEnvio(pedido, token) {
  const envioData = {
    destinatario: {
      nombre: pedido.datosEnvio.nombre + ' ' + pedido.datosEnvio.apellido,
      email: pedido.datosEnvio.email,
      telefono: pedido.datosEnvio.telefono,
      domicilio: {
        calle: pedido.datosEnvio.direccion,
        localidad: pedido.datosEnvio.localidad,
        provincia: pedido.datosEnvio.provincia,
        codigoPostal: pedido.datosEnvio.codigoPostal,
      },
    },
    producto: "PAQUETE",
    bultos: [
      {
        peso: 1, // o lo que corresponda
        volumen: 1,
        valorDeclarado: pedido.total,
      },
    ],
    origen: {
      // reemplaza con los datos de tu punto de despacho
      codigoPostal: "1407",
      localidad: "CABA",
      sucursalCliente: "ECO",
    },
    cliente: process.env.ANDREANI_CLIENT_NUMBER, // número de cliente
    referenciaCliente: pedido._id.toString(),
  };

  const res = await fetch('https://api.andreani.com/v1/envíos  ', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(envioData),
  });

  if (!res.ok) {
    const error = await res.json();
    console.error('Error de Andreani:', error);
    throw new Error('No se pudo generar el envío');
  }

  return res.json(); // contiene IDs y más info
}

async function obtenerTokenAndreani() {
  const res = await fetch('https://api.andreani.com/v1/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.ANDREANI_CLIENT_ID,
      client_secret: process.env.ANDREANI_CLIENT_SECRET,
    }),
  });

  if (!res.ok) {
    throw new Error('Error al obtener el token de Andreani');
  }

  const data = await res.json();
  return data.access_token;
}

async function obtenerEtiquetaPDF(idEnvio, token) {
  const res = await fetch(`https://api.andreani.com/v1/impresiones/${idEnvio}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/pdf',
    },
  });

  if (!res.ok) throw new Error('No se pudo obtener la etiqueta');

  return await res.arrayBuffer(); // PDF como binary
}
