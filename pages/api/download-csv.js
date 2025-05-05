// pages/api/download-csv.js
import { connectDB } from '../../src/lib/mongodb';
import Producto from '../../src/models/product';
import { parse } from 'json2csv';

export default async function handler(req, res) {
  try {
    await connectDB();

    const products = await Producto.find().lean();

    if (!products || products.length === 0) {
      return res.status(404).json({ error: 'No products found' });
    }

    const fields = [
      'cod_producto',
      'n_producto',
      'nombre',
      'marca',
      'vehiculo',
      'categoria',
      'descripcion',
      'destacados',
      'modelo',
      'n_serie',
      'titulo_de_producto',
      'n_electronica',
      'medidas',
      'foto_1_1',
      'foto_1_2',
      'foto_1_3',
      'foto_1_4',
    ];

    const opts = { fields };
    const csv = parse(products, opts);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error downloading CSV:', error);
    return res.status(500).json({ error: 'Error downloading CSV' });
  }
}
