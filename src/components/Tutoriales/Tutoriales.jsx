// Tutoriales/YouTubeLite.jsx
'use client';

import { useState } from 'react';

export default function YouTubeLite({ videoId, title, thumb }) {
  const [play, setPlay] = useState(false);

  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-xl bg-black"
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
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full p-4 bg-white/90 shadow">
              {/* Botón play simple */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <h3 className="text-white text-sm font-medium line-clamp-2">
              {title}
            </h3>
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
  );
}
