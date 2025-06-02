import { NextRequest } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Order from '../../../../models/Order';
import cloudinary from '../../../../lib/cloudinary';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  await connectDB();

  const formData = await req.formData();
  const file = formData.get('file') as File;
  const numeroComprobante = formData.get('numeroComprobante') as string;
  const pedidoId = formData.get('pedidoId') as string;

  if (!file || !numeroComprobante || !pedidoId) {
    return Response.json({ success: false, error: 'Datos incompletos' }, { status: 400 });
  }

  if (!mongoose.Types.ObjectId.isValid(pedidoId)) {
    return Response.json({ success: false, error: 'ID de pedido no válido' }, { status: 400 });
  }

  const pedido = await Order.findById(pedidoId);
  if (!pedido) {
    return Response.json({ success: false, error: 'Pedido no encontrado' }, { status: 404 });
  }

  if (pedido.paymentMethod !== 'transferencia' || pedido.estado !== 'pendiente') {
    return Response.json({ success: false, error: 'El pedido no permite adjuntar ticket' }, { status: 400 });
  }

  try {
    // Subir archivo a Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'tickets_transferencia',
          public_id: `pedido_${pedido._id}`,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      ).end(buffer);
    });

    const ticketUrl = (uploadResult as any).secure_url;

    // Guardar comprobante y número de transferencia (sin validar pago)
    pedido.paymentId = numeroComprobante;
    pedido.metadata = {
      ...pedido.metadata,
      ticketUrl,
    };
    await pedido.save();

    return Response.json({ success: true, ticketUrl });
  } catch (error) {
    console.error('Error general en guardar ticket:', error);
    return Response.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}
