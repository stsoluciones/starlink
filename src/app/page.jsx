// app/(tu-ruta)/page.js o productos/[nombre]/page.js
import dynamic from 'next/dynamic';
import Script from 'next/script';
import ClientLayout from './ClientLayout';
import { defaultMetadata } from '../lib/metadata';
import fetchProduct from '../Utils/fetchProduct';

const MainContent = dynamic(() => import('./home/MainContent'));

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
  const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://slsoluciones.com.ar/';
  const metadataBase = new URL(SITE);
  const canonical = `${SITE}productos/${encodeURIComponent(rawSlug)}`;

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
    }
  };
}

export default function HomePage() {
  const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://slsoluciones.com.ar/';
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE}#organization`,
        name: 'SLS Soluciones',
        url: SITE,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE}logos/logo_slsoluciones.png`,
          width: 300,
          height: 60
        },
        sameAs: [
          'https://www.facebook.com/slsoluciones',
          'https://www.instagram.com/slsoluciones'
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Ventas',
          areaServed: 'AR',
          availableLanguage: ['Spanish']
        }
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE}#website`,
        url: SITE,
        name: 'SLS Soluciones',
        description: 'Internet satelital y soluciones de conectividad en Argentina.',
        publisher: { '@id': `${SITE}#organization` },
        inLanguage: 'es-AR'
      },
      {
        '@type': 'WebPage',
        '@id': `${SITE}#webpage`,
        url: SITE,
        name: 'SLS Soluciones - Internet Satelital Starlink en Argentina',
        isPartOf: { '@id': `${SITE}#website` },
        about: { '@id': `${SITE}#organization` },
        description: 'Internet satelital y soluciones de conectividad en Argentina.',
        inLanguage: 'es-AR'
      }
    ]
  };

  return (
    <>
      <Script
        id="home-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        strategy="beforeInteractive"
      />
      <ClientLayout>
        <MainContent />
      </ClientLayout>
    </>
  );
}
