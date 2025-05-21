// pages/api/productos/[slug].js
import { connectDB } from '../../../src/lib/mongodb';
import Producto from '../../../src/models/product';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    await connectDB();    

    const { slug } = req.query;
    const formattedSlug = slug.replace(/_/g, ' ');

    try {
      const product = await Producto.findOne({ 
        nombre: { $regex: new RegExp(`^${formattedSlug}$`, 'i') }
      }).lean();

      if (!product || Object.keys(product).length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      return res.status(200).json(product);
    } catch (error) {
      console.error("Error al buscar producto:", error);
      return res.status(500).json({ error: 'Error al obtener el producto' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
