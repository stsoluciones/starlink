//app/api/updateProduct/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Producto from '../../../models/product';

export async function PUT(request) {
  await connectDB();

  const data = await request.formData();
  // console.log('back Data:', data);
  
  const productData = {};
  data.forEach((value, key) => {
    productData[key] = key === 'destacados' ? (value === 'true') : value;
  });

  const { _id, ...updateData } = productData;
  //console.log('Datos a enviar a MongoDB:', productData);

  try {
    // Obtén el documento actual de la base de datos
    const currentProduct = await Producto.findById(_id);
    if (!currentProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Crear una lista de claves de fotos esperadas
    const expectedPhotos = ['foto_1_1', 'foto_1_2', 'foto_1_3', 'foto_1_4'];

    // Eliminar las fotos no enviadas del documento actual
    expectedPhotos.forEach(photoKey => {
      if (!updateData[photoKey] && currentProduct[photoKey]) {
        currentProduct[photoKey] = undefined;
      }
    });

    // Actualizar el documento con las fotos enviadas
    Object.keys(updateData).forEach(key => {
      currentProduct[key] = updateData[key];
    });

    // Guardar el documento actualizado en la base de datos
    const updatedProduct = await currentProduct.save();

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Error updating product' }, { status: 500 });
  }
}
