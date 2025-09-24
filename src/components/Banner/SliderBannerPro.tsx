'use client';

import { useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import Image from 'next/image';

/** Inserta transformaciones de Cloudinary /f_auto,q_auto,w_<w>/ luego de /upload/  */
const cldImg = (url: string, w = 1600) =>
  url.includes('/upload/')
    ? url.replace('/upload/', `/upload/f_auto,q_auto,w_${w}/`)
    : url;

type Slide = string; // puede ser .mp4 o imagen

type Props = {
  /** Slides para desktop (>= md). Requerido si no usas mobileSlides */
  desktopSlides: Slide[];
  /** Slides para mobile (< md). Si no viene, se usan los de desktop */
  mobileSlides?: Slide[];
  /** Intervalo en ms entre cambios */
  intervalMs?: number;
  /** Póster por defecto para videos (si el .mp4 no trae poster propio) */
  defaultVideoPoster?: string;
  /** Ancho target para imágenes de Cloudinary (w_) */
  imageWidth?: number;
  /** Índice inicial del carrusel */
  startIndex?: number;
  /** Mostrar overlay de degradado */
  showGradient?: boolean;
  /** Clase extra para el contenedor principal */
  className?: string;

  /** Contenido de la columna izquierda (ej: <SobreMi />) */
  leftContent?: ReactNode;
  /** Altura del slider (clases Tailwind, ej: "h-80 md:h-96") */
  sliderHeightClass?: string;

  /** Callback cuando cambia el slide activo */
  onSlideChange?: (index: number) => void;

  /** Texto/descripción bajo el slider (opcional) */
  footerText?: ReactNode;
};

export default function SliderBannerPro({
  desktopSlides,
  mobileSlides,
  intervalMs = 3500,
  defaultVideoPoster,
  imageWidth = 1600,
  startIndex = 0,
  showGradient = true,
  className = '',
  leftContent,
  sliderHeightClass = 'h-80 md:h-96',
  onSlideChange,
  footerText,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const [isMobile, setIsMobile] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Lista según viewport
  const slides = useMemo<Slide[]>(
    () => (isMobile ? mobileSlides || desktopSlides : desktopSlides),
    [isMobile, desktopSlides, mobileSlides]
  );

  const len = slides.length;
  const nextIndex = (activeIndex + 1) % (len || 1);
  const visible = len > 1 ? [activeIndex, nextIndex] : [activeIndex];

  // Detectar mobile en mount + resize
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Interval limpio
  useEffect(() => {
    if (len <= 1 || intervalMs <= 0) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((i) => {
        const ni = (i + 1) % len;
        onSlideChange?.(ni);
        return ni;
      });
    }, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [len, intervalMs, onSlideChange]);

  // Helpers
  const isVideo = (src: string) => src.trim().toLowerCase().endsWith('.mp4');

  return (
    <section
      id="inicio"
      className={`w-full flex flex-col p-2 md:p-6 justify-center items-center ${className}`}
    >
      <div className="flex flex-col-reverse md:flex-row items-center justify-center gap-4 md:gap-6 w-full">
        {/* Columna Izquierda (contenido libre) */}
        <div className="w-full md:w-1/2 flex justify-center items-center">
          {leftContent ?? null}
        </div>

        {/* Columna Derecha: Slider */}
        <div
          className={`w-full md:w-1/2 relative overflow-hidden md:rounded-lg ${sliderHeightClass}`}
        >
          {visible.map((idx) => {
            const src = slides[idx];
            const active = idx === activeIndex;
            const video = isVideo(src);

            return (
              <div
                key={`${idx}-${src}`}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  active ? 'opacity-100' : 'opacity-0'
                }`}
                aria-hidden={!active}
              >
                {video ? (
                  <video
                    key={`v-${idx}`}
                    className="block w-full h-full object-cover"
                    src={src}
                    muted
                    loop
                    playsInline
                    autoPlay={active}
                    preload="none"
                    // Usa poster por defecto si lo pasás por props
                    poster={defaultVideoPoster}
                  />
                ) : (
                  <Image
                    unoptimized={false}
                    src={cldImg(src, imageWidth)}
                    alt={`Slide ${idx + 1}`}
                    title={`Slide ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={activeIndex === startIndex && idx === startIndex}
                    loading={idx === activeIndex ? 'eager' : 'lazy'}
                    className="object-cover"
                  />
                )}

                {showGradient && (
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 via-transparent to-black/20" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {footerText && (
        <div className="mt-4 md:mt-6 w-full md:max-w-7xl">
          {typeof footerText === 'string' ? (
            <h2 className="text-gray-700 border-2 shadow-xl rounded-lg border-primary sm:text-lg md:text-xl font-light w-full p-2 text-justify">
              {footerText}
            </h2>
          ) : (
            footerText
          )}
        </div>
      )}
    </section>
  );
}
