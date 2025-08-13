// app/api/productos/[nombre]/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Producto from '../../../../models/product';

// Escapa caracteres especiales de RegExp
export const runtime = 'nodejs'; // asegura Node para Mongoose

const escapeRegex = (s = '') => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeName = (s = '') =>
  String(s).replace(/[_-]/g, ' ').replace(/\s+/g, ' ').trim();

const makeSlug = (s = '') =>
  String(s).toLowerCase()
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$|/g, '');

export async function GET(_req, { params }) {
  try {
    await connectDB();

    const raw = params?.nombre ?? '';
    const normalized = normalizeName(decodeURIComponent(raw));
    if (!normalized) {
      return NextResponse.json({ error: 'Parámetro inválido' }, { status: 400 });
    }

    const targetSlug = makeSlug(normalized);
    const nameRegex = new RegExp(`^${escapeRegex(normalized)}$`, 'i');

    const product = await Producto.findOne({
      $or: [{ slug: targetSlug }, { nombre: nameRegex }],
    }).lean();

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (err) {
    console.error('Error al buscar producto:', err);
    return NextResponse.json({ error: 'Error al obtener el producto' }, { status: 500 });
  }
}