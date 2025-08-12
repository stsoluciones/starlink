// app/(tu-ruta)/page.js o productos/[nombre]/page.js
import dynamic from 'next/dynamic';
import ClientLayout from './ClientLayout';
import { defaultMetadata } from '../lib/metadata';
import fetchProduct from '../Utils/fetchProduct';

const MainContent = dynamic(() => import('./home/MainContent'), { ssr: false });

// --- utils locales ---
const pick = (v, fb) => (v ?? v === 0 ? v : fb);
const truncate = (str = '', max = 180) => {
  if (!str) return '';
  if (str.length <= max) return str;
  const cut = str.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 50 ? cut.slice(0, lastSpace) : cut).trim() + '…';
};
const clean = (str = '') => String(str).replace(/\s+/g, ' ').trim();
const toAbs = (url) => {
  try { return new URL(url).toString(); } catch { return null; }
};

export async function generateMetadata({ params }) {
  // Si no hay params, devolvés defaults rápido
  if (!params || !params.nombre) return defaultMetadata;

  // Normalizá el slug por si viene con underscores o encoding
  const rawSlug = decodeURIComponent(params.nombre);
  const nameFromSlug = clean(rawSlug.replace(/_/g, ' '));

  // Traé el producto – si falla, seguimos con defaults + canonical por producto
  let product = null;
  try {
    product = await fetchProduct(nameFromSlug);
  } catch (_) {}

  // Base para URLs absolutas (mejora OG/Twitter/canonical)
  const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://slsoluciones.com.ar';
  const metadataBase = new URL(SITE);
  const canonical = `${SITE}/productos/${encodeURIComponent(rawSlug)}`;

  // Datos del producto (con fallbacks)
  const nombre   = clean(pick(product?.nombre, nameFromSlug));
  const modelo   = clean(pick(product?.modelo, ''));
  const categoria= clean(pick(product?.categoria, ''));
  const marca    = clean(pick(product?.marca, 'SLS'));
  const tituloProducto = [nombre, modelo, categoria, marca, 'SLS']
    .filter(Boolean).join(' - ');

  const descSrc = product?.descripcion || product?.resumen || '';
  const descripcion = truncate(
    `${tituloProducto}${descSrc ? ' — ' + clean(descSrc) : ''}`,
    180
  );

  // Imagen OG/Twitter
  const defaultOg = defaultMetadata?.openGraph?.images?.[0];
  const defaultOgUrl =
    (typeof defaultOg === 'string' ? defaultOg : defaultOg?.url) ||
    'https://slsoluciones.com.ar/og/og-sls-starlink-mini.jpg';

  const foto = toAbs(product?.foto_1_1) || defaultOgUrl;

  // Keywords razonables (sin keyword stuffing)
  const keywords = Array.from(
    new Set(
      [
        nombre,
        modelo,
        categoria,
        marca,
        'Starlink Mini',
        'fuente elevadora',
        'internet satelital',
        'Argentina',
        'SLS Soluciones'
      ]
      .concat((product?.tags || []).slice(0, 6))
    )
  ).filter(Boolean).join(', ');

  return {
    ...defaultMetadata,
    metadataBase, // hace que OG/canonical relativos se resuelvan a absolutos

    // Título/desc
    title: tituloProducto || defaultMetadata.title,
    description: descripcion || defaultMetadata.description,
    keywords,

    // Icon (evita undefined)
    icons: {
      icon: [{ url: '/favicon.ico' }],
      apple: [{ url: '/apple-touch-icon.png' }]
    },

    openGraph: {
      ...(defaultMetadata.openGraph || {}),
      title: tituloProducto || defaultMetadata.openGraph?.title,
      description: descripcion || defaultMetadata.openGraph?.description,
      url: canonical,
      type: 'product', // más específico que "website"
      siteName: 'SLS Soluciones',
      locale: 'es_AR',
      images: [
        { url: foto, width: 1200, height: 630, alt: `${nombre} - ${marca}` }
      ]
    },

    twitter: {
      ...(defaultMetadata.twitter || {}),
      title: tituloProducto || defaultMetadata.twitter?.title,
      description: descripcion || defaultMetadata.twitter?.description,
      images: [foto],
      card: 'summary_large_image'
    },

    alternates: { canonical },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1
      }
    },

    // Opcional: Structured Data directo en metadata (si usás Next 14 con `other`)
    other: {
      'script:ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: nombre,
        brand: { '@type': 'Brand', name: marca || 'SLS' },
        category: categoria || 'Conectividad',
        image: [foto],
        description: clean(descSrc) || descripcion,
        sku: product?.sku || product?._id || undefined,
        offers: {
          '@type': 'Offer',
          url: canonical,
          availability: 'https://schema.org/InStock',
          priceCurrency: 'ARS',
          price: product?.precio?.toString() || undefined
        }
      })
    }
  };
}

export default function HomePage() {
  return (
    <ClientLayout>
      <MainContent />
    </ClientLayout>
  );
}
