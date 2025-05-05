import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Producto from '../../../models/product';

export async function POST(request) {
  await connectDB();

  const data = await request.formData();
  const productData = {};
  data.forEach((value, key) => {
    productData[key] = value;
  });

  try {
    // Find the product with the highest product number
    const highestProduct = await Producto.findOne().sort({ n_producto: -1 }).exec();
    const newProductNumber = highestProduct ? highestProduct.n_producto + 1 : 1;

    // Generate cod_producto
    const categoria = productData.categoria.substring(0, 3).toUpperCase();
    const numeroProducto = String(newProductNumber).padStart(5, '0');
    const marca = productData.marca.substring(0, 3).toUpperCase();
    const cod_producto = `${categoria}${numeroProducto}${marca}`;

    // Assign new properties
    productData.n_producto = newProductNumber;
    productData.cod_producto = cod_producto;

    // Save the new product
    const newProduct = new Producto(productData);
    await newProduct.save();

    return NextResponse.json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Error creating product' }, { status: 500 });
  }
}
