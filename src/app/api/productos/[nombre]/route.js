// pages/api/productos/[slug].js
import { connectDB } from '../../../../lib/mongodb';
import Producto from '../../../../models/product';

// Escapa caracteres especiales de RegExp
const escapeRegex = (s = '') => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Normaliza posibles variantes del slug (guiones, underscores, espacios múltiples)
const normalizeName = (s = '') =>
  String(s)
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const makeSlug = (s = '') =>
  String(s)
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]+/g, '')
    .replace(/\-+/g, '-')
    .replace(/^\-|\-$/g, '');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await connectDB();

    const { slug = '' } = req.query;
    // `req.query.slug` viene decodificado por Next; igual normalizamos
    const normalized = normalizeName(slug);
    if (!normalized) {
      return res.status(400).json({ error: 'Parámetro inválido' });
    }

    const targetSlug = makeSlug(normalized);
    const nameRegex = new RegExp(`^${escapeRegex(normalized)}$`, 'i');

    // Busca por `slug` (si existe ese campo en tu schema) o por nombre exacto (case-insensitive)
    const product = await Producto.findOne({
      $or: [
        { slug: targetSlug },            // requiere campo `slug` en la colección
        { nombre: nameRegex },           // match exacto por nombre (sin importar may/min)
      ],
    }).lean();

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error('Error al buscar producto:', error);
    return res.status(500).json({ error: 'Error al obtener el producto' });
  }
}
