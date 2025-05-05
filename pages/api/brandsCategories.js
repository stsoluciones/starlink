import { connectDB } from '../../src/lib/mongodb';
import Producto from '../../src/models/product';

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  await connectDB();

  try {
    const marcas = await Producto.distinct("marca"); 
    const categorias = await Producto.distinct("categoria");

    return res.status(200).json({ marcas, categorias }); 
  } catch (error) {
    console.error("Error en la API:", error);
    return res.status(500).json({ error: "Error al obtener filtros" });
  }
}
