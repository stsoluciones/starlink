// app/api/updateDescuentoAll/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Producto from '../../../models/product';

export async function PUT(request) {
  await connectDB();

  try {
    const { descuento } = await request.json();

    if (typeof descuento !== 'number' || descuento < 0 || descuento > 100) {
      return NextResponse.json(
        { error: 'Descuento inválido, debe ser número entre 0 y 100' },
        { status: 400 }
      );
    }

    // Actualiza el campo descuento en todos los productos
    const result = await Producto.updateMany(
      {},
      { $set: { descuento: descuento } }
    );

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
      message: `Se actualizó el descuento a ${descuento}% en todos los productos.`,
    });
  } catch (error) {
    console.error('Error al actualizar descuento en todos los productos:', error);
    return NextResponse.json(
      { error: 'Error al actualizar descuento' },
      { status: 500 }
    );
  }
}
