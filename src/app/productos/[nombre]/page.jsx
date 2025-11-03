// app/productos/[nombre]/page.jsx
export const runtime = 'nodejs';

import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { defaultMetadata } from '../../../lib/metadata';
import fetchProduct from '../../../Utils/fetchProduct';
import Productos from '../../../components/Tienda/Productos';

const Modal = dynamic(() => import('../../../components/Tienda/Modal/Modals'));
const ClientLayout = dynamic(() => import('../../ClientLayout'));

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://slsoluciones.com.ar/';

const clean = (s = '') => String(s).replace(/\s+/g, ' ').trim();
const truncate = (s = '', n = 180) => {
  if (!s) return '';
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  const i = cut.lastIndexOf(' ');
  return (i > 50 ? cut.slice(0, i) : cut).trim() + '…';
};
const toAbs = (u = '') => { try { return new URL(u, SITE).toString(); } catch { return null; } };

export async function generateMetadata({ params }) {
  const rawSlug = params?.nombre || '';
  const decoded = decodeURIComponent(rawSlug);
  const nameFromSlug = clean(decoded.replace(/_/g, ' '));

  let product = null;
  try {
    product = await fetchProduct(nameFromSlug);
  } catch (e) {
    console.error('generateMetadata fetchProduct error:', e);
  }

  const metadataBase = new URL(SITE);
  const canonical = new URL(`productos/${encodeURIComponent(rawSlug)}`, metadataBase).toString();

  if (!product) {
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

  const nombre = clean(product.nombre || nameFromSlug);
  const modelo = clean(product.modelo || '');
  const categoria = clean(product.categoria || '');
  const marca = clean(product.marca || 'SLS');

  const title = [nombre, modelo, categoria, marca, 'SLS'].filter(Boolean).join(' - ');
  const descSrc = clean(product.descripcion || '');
  const description = truncate(descSrc ? `${title} — ${descSrc}` : title, 180);

  const defaultOg = defaultMetadata?.openGraph?.images?.[0];
  const defaultOgUrl =
    (typeof defaultOg === 'string' ? defaultOg : defaultOg?.url) ||
    'https://slsoluciones.com.ar/og/og-sls-starlink-mini.jpg';
  const foto = toAbs(product.foto_1_1) || defaultOgUrl;

  const keywords = Array.from(new Set([
    nombre, modelo, categoria, marca,
    'Starlink Mini', 'fuente elevadora', 'internet satelital', 'Argentina', 'SLS Soluciones',
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
      type: 'website',
      siteName: 'SLS Soluciones',
      locale: 'es_AR',
      images: [{ url: foto, width: 1200, height: 630, alt: `${nombre} - ${marca}` }],
    },
    twitter: {
      ...(defaultMetadata.twitter || {}),
      title,
      description,
      images: [foto],
      card: 'summary_large_image',
    },
    alternates: { canonical },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
    },
  };
}

export default async function ProductoPage({ params }) {
  const rawSlug = params?.nombre || '';
  const nameFromSlug = clean(decodeURIComponent(rawSlug).replace(/_/g, ' '));

  let product = null;
  try {
    product = await fetchProduct(nameFromSlug);
  } catch (e) {
    console.error('ProductoPage fetchProduct error:', e);
  }

  if (!product) return notFound();

  // Datos para JSON-LD
  const nombre = clean(product.nombre || nameFromSlug);
  const modelo = clean(product.modelo || '');
  const categoria = clean(product.categoria || '');
  const marca = clean(product.marca || 'SLS');
  const descSrc = clean(product.descripcion || '');
  const canonical = new URL(`productos/${encodeURIComponent(rawSlug)}`, SITE).toString();
  
  const defaultOg = defaultMetadata?.openGraph?.images?.[0];
  const defaultOgUrl =
    (typeof defaultOg === 'string' ? defaultOg : defaultOg?.url) ||
    'https://slsoluciones.com.ar/og/og-sls-starlink-mini.jpg';
  const foto = toAbs(product.foto_1_1) || defaultOgUrl;

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: nombre,
        description: descSrc || `${nombre} - ${marca}`,
        sku: product?.sku || product?._id?.toString() || undefined,
        brand: { '@type': 'Brand', name: marca },
        category: categoria || undefined,
        image: [foto],
        url: canonical,
        offers: {
          '@type': 'Offer',
          url: canonical,
          priceCurrency: product?.usd ? 'USD' : 'ARS',
          price: product?.precio?.toString() || undefined,
          availability: product?.vendido ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
          priceValidUntil: new Date(new Date().getFullYear() + 1, 0, 1).toISOString().slice(0,10)
        }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE },
          { '@type': 'ListItem', position: 2, name: 'Productos', item: SITE + 'productos' },
          { '@type': 'ListItem', position: 3, name: nombre, item: canonical }
        ]
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ClientLayout className="flex flex-col h-screen" title={product?.nombre || 'Producto'}>
        <main className="flex-1 flex items-center justify-center bg-white">
          <Modal selectedProduct={product} isDialog={false} />
        </main>
        <div>
          <Productos />
        </div>
      </ClientLayout>
    </>
  );
}
