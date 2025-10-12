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

    console.log('Generando etiquetas para pedidos:', pedidos);

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

    console.log(`Encontrados ${pedidosSeleccionados.length} pedidos válidos`);

    // Obtener token de Andreani
    let token;
    try {
      token = await obtenerTokenAndreani();
      console.log('Token de Andreani obtenido exitosamente');
    } catch (error) {
      console.error('Error al obtener token de Andreani:', error);
      return NextResponse.json(
        { 
          error: 'Error al autenticar con Andreani. Verifica tus credenciales en las variables de entorno.',
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
        console.log(`Procesando pedido ${pedido._id}...`);

        // Verificar si ya tiene etiqueta
        if (pedido.etiquetaEnvio && pedido.trackingCode) {
          console.log(`Pedido ${pedido._id} ya tiene etiqueta`);
          etiquetas.push({
            pedidoId: pedido._id.toString(),
            mensaje: 'Ya tiene etiqueta generada',
            trackingCode: pedido.trackingCode,
            etiquetaExistente: true,
          });
          continue;
        }

        // Crear envío en Andreani
        const envio = await crearEnvio(pedido, token);
        console.log(`Envío creado para pedido ${pedido._id}:`, envio);

        const numeroDeEnvio = envio.numeroDeEnvio || envio.id;
        
        if (!numeroDeEnvio) {
          throw new Error('No se recibió número de envío de Andreani');
        }

        // Obtener etiqueta PDF
        const etiquetaPDF = await obtenerEtiquetaPDF(numeroDeEnvio, token);
        console.log(`Etiqueta obtenida para pedido ${pedido._id}`);

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
