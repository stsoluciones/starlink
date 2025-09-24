// app/(home)/page.tsx (o el archivo donde lo uses)
'use client';

import dynamic from 'next/dynamic';
import SliderBannerPro from './SliderBannerPro';

// Code-splitting del componente izquierdo (opcional)
const SobreMi = dynamic(() => import('../SobreMi/SobreMi'), { ssr: false });

const DESKTOP_SLIDES = [
  'https://res.cloudinary.com/dtfibzv3v/video/upload/v1747148131/AdaptadorStarlinkMiniEnUso_hhc4ej.mp4',
  'https://res.cloudinary.com/dtfibzv3v/image/upload/v1747603752/conector_zh1hpb.webp',
  'https://res.cloudinary.com/dtfibzv3v/image/upload/v1747603345/antena_cvb9w0.webp',
  'https://res.cloudinary.com/dtfibzv3v/image/upload/v1747603344/auto_qldyxb.webp',
  'https://res.cloudinary.com/dtfibzv3v/image/upload/v1747603344/antenaEnAuto_xw3yhy.webp',
];

const MOBILE_SLIDES = [
  'https://res.cloudinary.com/dtfibzv3v/video/upload/v1747148131/AdaptadorStarlinkMiniEnUso_hhc4ej.mp4',
  'https://res.cloudinary.com/dtfibzv3v/image/upload/v1747421305/00._prueba_blanca_Chrome_wxexf3.jpg',
  'https://res.cloudinary.com/dtfibzv3v/image/upload/v1747421305/IMG-20250309-WA0005_bd0bak.jpg',
];

export default function HomePage() {
  return (
    <SliderBannerPro
      desktopSlides={DESKTOP_SLIDES}
      mobileSlides={MOBILE_SLIDES}
      intervalMs={3500}
      defaultVideoPoster="https://res.cloudinary.com/dtfibzv3v/image/upload/f_auto,q_auto,w_1200/v1747603345/antena_cvb9w0.webp"
      imageWidth={1600}
      startIndex={0}
      showGradient
      leftContent={<SobreMi />}
      sliderHeightClass="h-80 md:h-96"
      onSlideChange={(i) => {
        // opcional: analytics, etc.
        // console.log('slide activo', i);
      }}
      footerText={
        <h2 className="text-gray-700 border-2 shadow-xl rounded-lg border-primary sm:text-lg md:text-xl font-light w-full p-2 text-justify">
          Encuentra los mejores productos y servicios aquí:{' '}
          <strong>Elevadores de tensión, alargues, baterías</strong> y muchos accesorios como la{' '}
          <strong>fuente adaptador de STARLINK mini.</strong> Además contamos con servicio de asesoramiento y envíos.
        </h2>
      }
    />
  );
}
