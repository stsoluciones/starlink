import { NextRequest } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Order from '../../../../models/Order';
import cloudinary from '../../../../lib/cloudinary';
import mongoose from 'mongoose';

// Máximo tamaño permitido: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const numeroTracking = formData.get('numeroTracking') as string;
    const pedidoId = formData.get('pedidoId') as string;

    if (!file || !numeroTracking || !pedidoId) {
      return Response.json(
        { success: false, error: 'Todos los campos son requeridos: archivo, número de tracking y ID de pedido' },
        { status: 400 }
      );
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return Response.json(
        { success: false, error: 'Formato de archivo no permitido. Solo se aceptan PDF, JPG o PNG' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { success: false, error: `El archivo es demasiado grande. Tamaño máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(pedidoId)) {
      return Response.json({ success: false, error: 'ID de pedido no válido' }, { status: 400 });
    }

    const pedido = await Order.findById(pedidoId);
    if (!pedido) {
      return Response.json({ success: false, error: 'Pedido no encontrado' }, { status: 404 });
    }

    if (!['enviado', 'pagado'].includes(pedido.estado)) {
      return Response.json(
        { success: false, error: 'El pedido no está en un estado que permita agregar etiquetas de envío' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Detectar si es PDF
    const isPDF = file.type === 'application/pdf';
    
    // Construct the public_id with the .pdf extension if it's a PDF
    const basePublicId = `etiqueta_pedido_${pedido._id}_${Date.now()}`;
    const publicIdWithExtension = isPDF ? `${basePublicId}.pdf` : basePublicId;

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: isPDF ? 'raw' : 'auto',
          folder: 'etiquetas_envio',
          public_id: publicIdWithExtension, // Use the public_id with extension here
          overwrite: true,
          // 'quality' is not applicable for raw files, you can remove it or keep it for images.
          // If you keep it, it will just be ignored for raw files.
          quality: isPDF ? undefined : 'auto:good', // Apply quality only for image types
        },
        (error, result) => {
          if (error) {
            console.error('Error al subir archivo a Cloudinary:', error);
            return reject(new Error('Error al subir archivo a Cloudinary'));
          }
          resolve(result);
        }
      ).end(buffer);
    });

    let etiquetaURL = (uploadResult as any).secure_url;
    // The previous URL correction might no longer be strictly necessary
    // if public_id handles the extension, but it's harmless to keep.
    // However, if the public_id already includes .pdf, Cloudinary will likely return
    // the secure_url with .pdf as well.

    const updatedOrder = await Order.findByIdAndUpdate(
      pedidoId,
      {
        etiquetaEnvio: etiquetaURL,
        trackingCode: numeroTracking.trim(),
        estado: 'enviado',
        updatedAt: new Date(),
      },
      { new: true }
    );

    return Response.json({
      success: true,
      etiquetaURL,
      trackingCode: numeroTracking.trim(),
      orderId: updatedOrder?._id,
      message: 'Etiqueta de envío guardada correctamente'
    });
  } catch (error) {
    console.error('Error en guardar-etiqueta:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor'
      },
      { status: 500 }
    );
  }
}