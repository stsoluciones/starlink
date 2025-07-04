import { NextRequest } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Order from '../../../../models/Order';
import cloudinary from '../../../../lib/cloudinary';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Verificar que el cuerpo sea JSON
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Cuerpo de la solicitud debe ser JSON'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { pedidoId } = body;

    // Validar ID del pedido
    if (!mongoose.Types.ObjectId.isValid(pedidoId)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'ID de pedido no válido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Buscar el pedido
    const pedido = await Order.findById(pedidoId);
    if (!pedido) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Pedido no encontrado'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar si tiene etiqueta para eliminar
    if (!pedido.etiquetaEnvio) {
      return new Response(JSON.stringify({
        success: false,
        error: 'El pedido no tiene etiqueta de envío'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Extraer public_id de la URL de Cloudinary
    const urlParts = pedido.etiquetaEnvio.split('/');
    const publicIdWithExtension = urlParts[urlParts.length - 1];
    const publicId = publicIdWithExtension.split('.')[0];
    const fullPublicId = `etiquetas_envio/${publicId}`;

    // Eliminar de Cloudinary
    try {
      await cloudinary.uploader.destroy(fullPublicId);
    } catch (error) {
      console.error('Error al eliminar de Cloudinary:', error);
      // Continuar aunque falle en Cloudinary
    }

    // Actualizar el pedido
    const updatedOrder = await Order.findByIdAndUpdate(
      pedidoId,
      {
        $unset: { etiquetaEnvio: 1, trackingCode: 1 },
        estado: 'pagado', // Revertir a estado anterior
        updatedAt: new Date(),
      },
      { new: true }
    );

    return new Response(JSON.stringify({
      success: true,
      orderId: updatedOrder?._id,
      message: 'Etiqueta de envío eliminada correctamente'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al eliminar etiqueta:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}