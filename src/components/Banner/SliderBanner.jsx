'use client'
import { useState, useEffect } from 'react';
import SobreMi from '../SobreMi/SobreMi';


const SliderBanner = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const slides = [
    "https://res.cloudinary.com/dtfibzv3v/video/upload/v1747148131/AdaptadorStarlinkMiniEnUso_hhc4ej.mp4",
    "https://res.cloudinary.com/dtfibzv3v/image/upload/v1747603752/conector_zh1hpb.webp",
    "https://res.cloudinary.com/dtfibzv3v/image/upload/v1747603345/antena_cvb9w0.webp",
    "https://res.cloudinary.com/dtfibzv3v/image/upload/v1747603344/auto_qldyxb.webp",
    "https://res.cloudinary.com/dtfibzv3v/image/upload/v1747603344/antenaEnAuto_xw3yhy.webp"
  ];

  const SlidesMovil = [
    "https://res.cloudinary.com/dtfibzv3v/video/upload/v1747148131/AdaptadorStarlinkMiniEnUso_hhc4ej.mp4",
    "https://res.cloudinary.com/dtfibzv3v/image/upload/v1747421305/00._prueba_blanca_Chrome_wxexf3.jpg",
    "https://res.cloudinary.com/dtfibzv3v/image/upload/v1747421305/IMG-20250309-WA0005_bd0bak.jpg",
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // Set the initial state
    window.addEventListener('resize', handleResize);

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % (isMobile ? SlidesMovil.length : slides.length));
    }, 3000); // Cambia la imagen cada 3 segundos

    return () => {
      clearInterval(interval); // Limpia el intervalo al desmontar el componente
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobile, slides.length, SlidesMovil.length]);

  const currentSlides = isMobile ? SlidesMovil : slides;

  return (
    <section id="inicio" className="w-full flex flex-col p-2 md:p-6 justify-center items-center">
      {/* Columna Izquierda: SobreMi */}
      <div className="flex flex-col-reverse md:flex-row items-center justify-center">
        <div className="w-full md:w-1/2 flex justify-center items-center">
          <SobreMi />
        </div>

        {/* Columna Derecha: Slider */}
        <div className="w-full md:w-1/2 relative overflow-hidden shadow-lg md:shadow-none md:rounded-lg h-80 md:h-96">
          {currentSlides.map((slide, index) => {
            const isActive = index === activeIndex;
            const isVideo = slide.endsWith('.mp4');

            return (
              <div key={index} className={`absolute inset-0 transition-opacity ${isVideo ? 'duration-1000' : 'duration-700'} ease-in-out ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                {isVideo ? (
                  <video
                    src={slide}
                    className="block w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    title={`Video del Local ${index + 1}`}
                    aria-label={`Video del Local ${index + 1}`}
                  />
                ) : (
                  <img
                    src={slide}
                    className="block w-full h-full object-cover"
                    alt={`Slide ${index + 1}`}
                    aria-label={`Imagen del Local ${index + 1}`}
                    title={`Imagen del Local ${index + 1}`}
                  />
                )}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 via-transparent to-black/20" />

              </div>
            );
          })}
        </div>
      </div>
      <h2 className="text-gray-700 border-2 shadow-xl rounded-lg border-primary sm:text-lg md:text-xl font-light md:max-w-7xl w-full p-2 text-justify">
          Encuentra los mejores productos y servicios aquí: <strong>Elevadores de tensión, alargues, baterias</strong> y muchos accesorios como la <strong>fuente adaptador de STARLINK mini.</strong> Además contamos con Servicio de asesoramiento y envíos  .
      </h2>

    </section>

  );
};

export default SliderBanner;