// Next.js App Router – genera /sitemap.xml automáticamente
// Revalida una vez por día (ajustá si querés)
export const revalidate = 60 * 60 * 24;

import { connectDB } from '../lib/mongodb';
import Producto from '../models/product';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://slsoluciones.com.ar/';

// Helpers
const toSlug = (nombre = '') =>
  encodeURIComponent(String(nombre).trim().replace(/\s+/g, '_'));

export default async function sitemap() {
  // 1) Rutas estáticas (solo las que sí querés indexar)
  const staticEntries = [
    { url: `${SITE}/`, lastModified: new Date() },
    // si tenés landings, agregalas acá:
    // { url: `${SITE}/starlink-mini`, lastModified: new Date() },
    // { url: `${SITE}/fuente-elevadora-starlink-mini`, lastModified: new Date() },
  ];

  // 2) Rutas dinámicas de productos desde Mongo
  let productEntries = [];
  try {
    await connectDB();
    const productos = await Producto
      .find({}, { nombre: 1, updatedAt: 1, foto_1_1: 1 })
      .sort({ updatedAt: -1 })
      .lean();

    productEntries = productos
      .filter(p => p?.nombre)
      .map(p => {
        const slug = toSlug(p.nombre);
        return {
          url: `${SITE}/productos/${slug}`,
          lastModified: p.updatedAt || new Date(),
          // Next soporta imágenes en el sitemap (útil para rich results de imágenes)
          images: p.foto_1_1 ? [p.foto_1_1] : undefined,
        };
      });
  } catch (e) {
    // Si falla la DB, devolvemos solo las estáticas
    console.error('Sitemap DB error:', e);
  }

  // 3) ¡Listo! (No incluimos Shopcart/Login/Register aquí)
  return [...staticEntries, ...productEntries];
}
