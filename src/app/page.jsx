import dynamic from 'next/dynamic';
import ClientLayout from './ClientLayout';
import { defaultMetadata } from '../lib/metadata';
import fetchProduct from '../Utils/fetchProduct';

const MainContent = dynamic(() => import('./home/MainContent'), { ssr: false });

export async function generateMetadata({ params }) {
  const product = await fetchProduct(params.nombre);
  if (!params || !params.nombre) return defaultMetadata;
  //console.log('producto de meta:', product);

  return {
    ...defaultMetadata, // Usa los valores por defecto si no están definidos en el producto
    title: `${product.nombre} - ${product.modelo} - ${product.categoria} - ${product.marca} - SLS` || defaultMetadata.title,
    description: product.nombre? `${product.nombre} - ${product.modelo} - ${product.categoria} - ${product.marca} - SLS ${product.descripcion.slice(0, 200)}`: defaultMetadata.description,
    keywords: `${product.titulo_de_producto} - SLS ${product.descripcion.slice(0, 200)}` || defaultMetadata.keywords,
    icons: [{ url: product.foto_1_1 || defaultMetadata.openGraph.images[0].url }],
    openGraph: {
      ...defaultMetadata.openGraph,
      title: `${product.nombre} - ${product.modelo} - ${product.categoria} - ${product.marca} - SLS` || defaultMetadata.openGraph.title,
      description: product.nombre? `${product.nombre} - ${product.modelo} - ${product.categoria} - ${product.marca} - SLS ${product.descripcion.slice(0, 200)}`: defaultMetadata.description,
      images: [{ url: product.foto_1_1 || defaultMetadata.openGraph.images[0].url }],
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/productos/${params.nombre}`,
      type: 'website',
    },
    twitter: {
      ...defaultMetadata.twitter,
      title: `${product.nombre} ` || defaultMetadata.twitter.title,
      description: product.nombre? `${product.nombre} - ${product.modelo} - ${product.categoria} - ${product.marca} - SLS ${product.descripcion.slice(0, 200)}`: defaultMetadata.description,
      images: [{ url: product.foto_1_1 || defaultMetadata.twitter.images[0].url }],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/productos/${params.nombre}`,
    },
  };
}

export default function HomePage() {
    return (
        <ClientLayout>
          <MainContent />
        </ClientLayout>
    );
}
