
import React from 'react';

const Banner = () => {
  return (
    <header id="home" role="banner" aria-label="Banner principal de Eshop Devices" className="relative w-full flex items-center justify-center overflow-hidden">
      <div className="text-center z-10 m-2 p-2 max-w-6xl">
        {/* Tagline de la tienda */}
        <h2 title="Tienda de Dispositivos Informáticos" className="text-2xl md:text-5xl lg:text-6xl text-transparent font-bold mb-4 bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary"> TIENDA DE INFORMATICA</h2>
      </div>
    </header>
  );
};

export default Banner;
