import { connectDB } from '../../src/lib/mongodb';
import Producto from '../../src/models/product';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  await connectDB();

  try {
    const { _id, destacados } = req.body;
    const updatedProduct = await Producto.findByIdAndUpdate(
      _id,
      { destacados },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    return res.status(500).json({ error: 'Error al actualizar el producto' });
  }
}
