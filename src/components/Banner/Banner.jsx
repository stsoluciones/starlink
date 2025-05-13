import React from 'react';

const Banner = () => {
  return (
    <header
      id="home"
      role="banner"
      aria-label="Banner principal de Eshop Devices"
      className="relative w-screen h-screen overflow-hidden flex items-center justify-center"
    >
      {/* Video de fondo */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        src="https://res.cloudinary.com/dtfibzv3v/video/upload/v1747148131/AdaptadorStarlinkMiniEnUso_hhc4ej.mp4"
        autoPlay
        muted
        loop
        playsInline
        title="Adaptador Starlink Mini en uso"
        aria-label="Adaptador Starlink Mini en uso"
      >
        Tu navegador no soporta el elemento de video.
      </video>

      {/* Capa oscura opcional para mejorar contraste del texto */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/40 z-10"></div>

      {/* Contenido encima del video */}
      <div className="relative z-20 text-center text-white px-4">
        <h2 className="text-4xl md:text-6xl font-bold">Bienvenido a SLS</h2>
        <h3 className="mt-4 text-lg md:text-xl">Soluciones para antenas STARLINK</h3>
        {/* Botón opcional */}
        <a
          href="#productos"
          className="mt-6 inline-block bg-white text-black font-semibold px-6 py-3 rounded hover:bg-gray-200 transition"
        >
          Ver productos
        </a>
      </div>
    </header>
  );
};

export default Banner;
