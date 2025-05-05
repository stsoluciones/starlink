import dynamic from 'next/dynamic';
import { defaultMetadata } from '../../../lib/metadata';
import fetchProduct from '../../../Utils/fetchProduct';

const StarLinkAdapterInfo = dynamic(() => import('../../../components/Productos/Starlink/StarLinkAdapterInfo'))
const ClientLayout = dynamic(() => import('../../ClientLayout'))

export async function generateMetadata({ params }) {
  const product = await fetchProduct(params.nombre);
  if (!params || !params.nombre) return defaultMetadata;
  console.log('producto de meta:', product);

  return {
    ...defaultMetadata, // Usa los valores por defecto si no están definidos en el producto
    title: `Fuente Adaptador para Antena Starlink Mini | Trifix SL1230 - E-ShopDevices` || defaultMetadata.title,
    description: `Fuente adaptadora Trifix SL1230 para la Antena Starlink Mini, proporciona un suministro estable y seguro de energía. Ideal para viajes largos o instalaciones fijas. ${product.descripcion.slice(0, 200)}` || defaultMetadata.description,
    keywords: `adaptador, antena Starlink, Trifix SL1230, fuente de alimentación, 12V a 35V, energía estable, E-Shop Devices` || defaultMetadata.keywords,
    icons: [{ url: product.foto_1_1 || defaultMetadata.openGraph.images[0].url }],
    openGraph: {
      ...defaultMetadata.openGraph,
      title: `Fuente Adaptador para Antena Starlink Mini | Trifix SL1230 - E-ShopDevices` || defaultMetadata.openGraph.title,
      description: `Fuente adaptadora Trifix SL1230 para la Antena Starlink Mini, diseñada para ofrecer un suministro estable y eficiente de energía. ${product.descripcion.slice(0, 200)}` || defaultMetadata.description,
      images: [{ url: product.foto_1_1 || defaultMetadata.openGraph.images[0].url }],
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/productos/starlink-adapter-trifix-sl1230`,
      type: 'website',
    },
    twitter: {
      ...defaultMetadata.twitter,
      title: `Fuente Adaptador para Antena Starlink Mini | Trifix SL1230` || defaultMetadata.twitter.title,
      description: `Fuente adaptadora Trifix SL1230 para la Antena Starlink Mini, proporciona un suministro seguro y confiable para una conexión estable. ${product.descripcion.slice(0, 200)}` || defaultMetadata.description,
      images: [{ url: product.foto_1_1 || defaultMetadata.twitter.images[0].url }],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/productos/starlink-adapter-trifix-sl1230`,
    },
  };
  
}

const StarlinkPage = async () => {

  return (
    <ClientLayout title='Fuente StarLink Mini' className="flex flex-col h-screen">
      <main className="flex-1 flex items-center justify-center bg-white">
        <StarLinkAdapterInfo />
      </main>
    </ClientLayout>
  )
}

export default StarlinkPage;
