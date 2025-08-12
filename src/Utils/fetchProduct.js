// Utils/fetchProduct.js
const base = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SITE_URL || '')
  .replace(/\/$/, '');

const fetchProduct = async (nombre) => {
  try {
    if (!nombre) return null;
    const slug = encodeURIComponent(String(nombre));
    const url = `${base}/api/productos/${slug}`;

    const response = await fetch(url, {cache: 'no-store', next: { revalidate: 60 }});

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    return null;
  }
};

export default fetchProduct;
