// Tutoriales/YouTubeLite.jsx
'use client';

import { useState } from 'react';

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return '';
  }
}

export default function YouTubeLite({ videoId, title, thumb, publishedAt }) {
  const [play, setPlay] = useState(false);
  const [isVertical, setIsVertical] = useState(null);

  return (
    <div className="group">
      <div
        className="relative w-full overflow-hidden rounded-t-xl bg-black transition-transform will-change-transform group-hover:-translate-y-0.5 focus-within:scale-[1.01] aspect-[9/16] md:aspect-video"
        role="button"
        aria-label={`Reproducir: ${title}`}
        onClick={() => setPlay(true)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setPlay(true)}
        tabIndex={0}
      >
        {!play ? (
          <>
            <img
              src={thumb}
              alt={title}
              className="h-full w-full object-cover"
              loading="lazy"
              onLoad={(e) => {
                try {
                  const img = e.target;
                  const w = img.naturalWidth || img.width;
                  const h = img.naturalHeight || img.height;
                  setIsVertical(h / Math.max(1, w) > 1.05);
                } catch (err) {
                  setIsVertical(null);
                }
              }}
            />
            {/* badge que muestra orientación detectada una vez cargada la miniatura */}
            {isVertical !== null ? (
              <span className="absolute top-2 left-2 rounded-t-md bg-black/60 px-2 py-1 text-xs text-white">
                {isVertical ? 'Vertical' : 'Horizontal'}
              </span>
            ) : null}
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="rounded-full p-3 bg-white/95 shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <h3 className="text-white text-sm font-semibold line-clamp-2">{title}</h3>
            </div>
          </>
        ) : (
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        )}
      </div>

    </div>
  );
}
