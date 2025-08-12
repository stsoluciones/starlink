import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { defaultMetadata } from '../../../lib/metadata';
import fetchProduct from '../../../Utils/fetchProduct';
import Productos from '../../../components/Tienda/Productos';

const Modal = dynamic(() => import('../../../components/Tienda/Modal/Modals'));
const ClientLayout = dynamic(() => import('../../ClientLayout'));

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://slsoluciones.com.ar/';

// Helpers
const clean = (s = '') => String(s).replace(/\s+/g, ' ').trim();
const truncate = (s = '', n = 180) => {
  if (!s) return '';
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  const i = cut.lastIndexOf(' ');
  return (i > 50 ? cut.slice(0, i) : cut).trim() + '…';
};
const absUrl = (u) => {
  try { return new URL(u).toString(); } catch { return null; }
};

export async function generateMetadata({ params }) {
  if (!params?.nombre) return defaultMetadata;

  const rawSlug = params.nombre;
  if (!rawSlug) return notFound();

  const decodedSlug = decodeURIComponent(rawSlug);
  const nameFromSlug = clean(decodedSlug.replace(/_/g, ' '));

  if (!nameFromSlug) return notFound();

  let product = null;
  try {
    product = await fetchProduct(nameFromSlug);
  } catch {
    // Puedes loguear el error si quieres
  }

  if (!product) {
    const metadataBase = new URL(SITE);
    const canonical = `${SITE}productos/${encodeURIComponent(rawSlug)}`;

    return {
      ...defaultMetadata,
      metadataBase,
      title: 'Producto no encontrado | SLS',
      description: 'No se encontró el producto solicitado.',
      alternates: { canonical },
      robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
      openGraph: {
        ...(defaultMetadata.openGraph || {}),
        title: 'Producto no encontrado | SLS',
        description: 'No se encontró el producto solicitado.',
        url: canonical,
        type: 'website',
      },
    };
  }

  const metadataBase = new URL(SITE);
  const canonical = `${SITE}/productos/${encodeURIComponent(rawSlug)}`;

  const nombre = clean(product.nombre || nameFromSlug);
  const modelo = clean(product.modelo || '');
  const categoria = clean(product.categoria || '');
  const marca = clean(product.marca || 'SLS');

  const titleParts = [nombre, modelo, categoria, marca, 'SLS'].filter(Boolean);
  const title = titleParts.join(' - ');

  const descSrc = clean(product.descripcion || '');
  const description = truncate(
    descSrc ? `${title} — ${descSrc}` : title,
    180
  );

  const defaultOg = defaultMetadata?.openGraph?.images?.[0];
  const defaultOgUrl = (typeof defaultOg === 'string' ? defaultOg : defaultOg?.url)
    || 'https://slsoluciones.com.ar/og/og-sls-starlink-mini.jpg';

  const foto = absUrl(product.foto_1_1) || defaultOgUrl;

  const keywords = Array.from(new Set([
    nombre, modelo, categoria, marca,
    'Starlink Mini', 'fuente elevadora', 'internet satelital', 'Argentina', 'SLS Soluciones'
  ])).filter(Boolean).join(', ');

  return {
    ...defaultMetadata,
    metadataBase,
    title,
    description,
    keywords,
    openGraph: {
      ...(defaultMetadata.openGraph || {}),
      title,
      description,
      url: canonical,
      type: 'product',
      siteName: 'SLS Soluciones',
      locale: 'es_AR',
      images: [{ url: foto, width: 1200, height: 630, alt: `${nombre} - ${marca}` }]
    },
    twitter: {
      ...(defaultMetadata.twitter || {}),
      title,
      description,
      images: [foto],
      card: 'summary_large_image'
    },
    alternates: { canonical },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 }
    }
  };
}

export default async function ProductoPage({ params }) {
  const rawSlug = decodeURIComponent(params?.nombre || '');
  const nameFromSlug = clean(rawSlug.replace(/_/g, ' '));
  const product = await fetchProduct(nameFromSlug);

  if (!product) return notFound();

  return (
    <ClientLayout className="flex flex-col h-screen" title={product?.nombre || 'Producto'}>
      <main className="flex-1 flex items-center justify-center bg-white">
        <Modal selectedProduct={product} isDialog={false} />
      </main>
      <div>
        <Productos />
      </div>
    </ClientLayout>
  );
}
