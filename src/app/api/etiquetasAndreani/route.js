// src/app/api/etiquetasAndreani/route.js
import { NextResponse } from 'next/server';
import Order from "../../../models/Order";
import { connectDB } from "../../../lib/mongodb";
import { obtenerTokenAndreani, crearEnvio, obtenerEtiquetaPDF } from "../../../lib/andreani";

export async function POST(req) {
  try {
    await connectDB();

    const { pedidos } = await req.json();

    if (!pedidos || !Array.isArray(pedidos) || pedidos.length === 0) {
      return NextResponse.json(
        { error: 'Debe proporcionar un array de IDs de pedidos' },
        { status: 400 }
      );
    }

    console.log('Backend: Generando etiquetas para pedidos:', pedidos);

    // Buscar pedidos válidos (pagados y sin etiqueta)
    const pedidosSeleccionados = await Order.find({
      _id: { $in: pedidos },
      estado: 'pagado',
    }).lean();

    if (pedidosSeleccionados.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron pedidos válidos (deben estar en estado "pagado")' },
        { status: 400 }
      );
    }

    console.log(`Backend: Encontrados ${pedidosSeleccionados.length} pedidos válidos`);

    // Obtener API KEY de Andreani
    let apiKey;
    try {
      apiKey = await obtenerTokenAndreani(); // Retorna la APIKEY ahora
      console.log('API KEY de Andreani configurada exitosamente');
    } catch (error) {
      console.error('Error al obtener API KEY de Andreani:', error);
      return NextResponse.json(
        { 
          error: 'Error al autenticar con Andreani. Verifica que ANDREANI_API_KEY esté configurada en las variables de entorno.',
          detalle: error.message 
        },
        { status: 500 }
      );
    }

    const etiquetas = [];
    const errores = [];

    // Procesar cada pedido
    for (const pedido of pedidosSeleccionados) {
      try {
        console.log(`Backend: Procesando pedido ${pedido._id}...`);

        // Verificar si ya tiene etiqueta
        if (pedido.etiquetaEnvio && pedido.trackingCode) {
          console.log(`Backend: Pedido ${pedido._id} ya tiene etiqueta`);
          etiquetas.push({
            pedidoId: pedido._id.toString(),
            mensaje: 'Ya tiene etiqueta generada',
            trackingCode: pedido.trackingCode,
            etiquetaExistente: true,
          });
          continue;
        }

        // Crear envío en Andreani
        const envio = await crearEnvio(pedido, apiKey);
        console.log(`✅ Envío creado para pedido ${pedido._id}:`, JSON.stringify(envio, null, 2));

        // La respuesta puede tener el número de envío en diferentes lugares
        // Según la doc de Andreani: bultos[0].numeroDeEnvio o numeroDeEnvio directo
        let numeroDeEnvio = null;
        
        if (envio.bultos && envio.bultos.length > 0 && envio.bultos[0].numeroDeEnvio) {
          numeroDeEnvio = envio.bultos[0].numeroDeEnvio;
        } else if (envio.numeroDeEnvio) {
          numeroDeEnvio = envio.numeroDeEnvio;
        } else if (envio.id) {
          numeroDeEnvio = envio.id;
        } else if (typeof envio === 'string') {
          // Si la respuesta es solo el número de envío como string
          numeroDeEnvio = envio;
        }
        
        if (!numeroDeEnvio) {
          console.error('Respuesta de Andreani sin número de envío:', envio);
          throw new Error('No se recibió número de envío de Andreani. Verifica la respuesta de la API.');
        }

        console.log(`📦 Número de envío obtenido: ${numeroDeEnvio}`);

        // Obtener etiqueta PDF
        const etiquetaPDF = await obtenerEtiquetaPDF(numeroDeEnvio, apiKey);
        console.log(`✅ Etiqueta PDF obtenida para pedido ${pedido._id} (${etiquetaPDF.byteLength} bytes)`);

        const etiquetaBase64 = Buffer.from(etiquetaPDF).toString('base64');

        // Actualizar pedido con tracking y etiqueta
        await Order.findByIdAndUpdate(pedido._id, {
          trackingCode: numeroDeEnvio,
          etiquetaEnvio: etiquetaBase64,
          estado: 'enviado',
        });

        etiquetas.push({
          pedidoId: pedido._id.toString(),
          trackingCode: numeroDeEnvio,
          etiqueta: etiquetaBase64,
          mensaje: 'Etiqueta generada exitosamente',
        });

        console.log(`✓ Etiqueta generada para pedido ${pedido._id}`);
      } catch (error) {
        console.error(`Error al procesar pedido ${pedido._id}:`, error);
        errores.push({
          pedidoId: pedido._id.toString(),
          error: error.message,
        });
      }
    }

    // Preparar respuesta
    const response = {
      mensaje: `Se procesaron ${etiquetas.length} de ${pedidosSeleccionados.length} pedidos`,
      exitosos: etiquetas.length,
      fallidos: errores.length,
      etiquetas,
      errores: errores.length > 0 ? errores : undefined,
    };

    console.log('Proceso completado:', response);

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error general al generar etiquetas:', error);
    return NextResponse.json(
      { 
        error: 'Error al generar etiquetas',
        detalle: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Endpoint para consultar el estado de un envío
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const pedidoId = searchParams.get('pedidoId');

    if (!pedidoId) {
      return NextResponse.json(
        { error: 'Debe proporcionar un ID de pedido' },
        { status: 400 }
      );
    }

    await connectDB();

    const pedido = await Order.findById(pedidoId).lean();

    if (!pedido) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    if (!pedido.trackingCode) {
      return NextResponse.json(
        { error: 'El pedido no tiene tracking code' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      pedidoId: pedido._id,
      trackingCode: pedido.trackingCode,
      etiqueta: pedido.etiquetaEnvio,
      estado: pedido.estado,
    });

  } catch (error) {
    console.error('Error al consultar etiqueta:', error);
    return NextResponse.json(
      { error: 'Error al consultar etiqueta', detalle: error.message },
      { status: 500 }
    );
  }
}
