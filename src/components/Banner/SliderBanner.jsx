'use client'
import { useState, useEffect } from 'react';


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
    <section id='inicio' className="relative w-full">
      <div>
        <div className="relative min-h-screen overflow-hidden rounded-lg md:h-96">
        {currentSlides.map((slide, index) => {
          const isActive = index === activeIndex;
          const isVideo = slide.endsWith('.mp4'); // podés mejorar esto con una función más robusta si querés

          return (
            <div key={index} className={`absolute inset-0 transition-opacity ${isVideo?'duration-1000':'duration-700'} ease-in-out ${isActive ? "opacity-100" : "opacity-0"}`} >
              {isVideo ? (
                <video
                  src={slide}
                  className="block w-full h-full object-cover "
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
            </div>
          );
        })}

          {/* Text overlay */}
          {/* <div className="absolute inset-0 flex justify-center items-center bottom-16 text-white z-10">
            <div className="text-center">
              <p className="text-[40px] md:text-[62px] text-primary leading-none font-oxanium tracking-wider"><strong>SLS</strong></p>
              <p className="text-[20px] md:text-[22px] text-secondary tracking-wide text-customBeige font-aileron font-light">SL Soluciones, para tus actividades</p>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default SliderBanner;