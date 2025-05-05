import { connectDB } from '../../src/lib/mongodb';
import Producto from '../../src/models/product';

export default async function GET(req, res) {
  await connectDB();
  try {
    const productos = await Producto.find({ destacados: true }).lean();
    //console.log("Productos obtenidos:", productos);  // Debugging line
    res.status(200).json({ productos });
  } catch (error) {
    console.error("Error en la API:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
}


