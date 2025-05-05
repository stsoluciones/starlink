import { connectDB } from '../../src/lib/mongodb';
import Producto from '../../src/models/product';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const productos = await Producto.find({});
      //console.log("Productos obtenidos:", productos); // Verifica si hay datos
      res.status(200).json({ productos: productos });
    } catch (error) {
      console.error("Error en la API:", error);
      res.status(500).json({ error: "Error al obtener productos" });
    }
  } else {
    res.status(405).json({ error: "Método no permitido" });
  }
}
