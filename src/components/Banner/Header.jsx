// Header.js
import React from 'react';
import StarlinkMiniBanner from '../Productos/Starlink/bannerStarLink';

export default function Header() {
  return (
    <>
      <div className="text-center py-4 max-w-6xl mx-auto">
        <h1 className="text-lg text-gray-600 px-2 text-justify md:text-center">
          Encuentra los mejores productos y servicios informáticos aquí: <strong>PC Gamers, PC mini para oficinas, PC profesionales</strong> y muchos accesorios para informática como la <strong>fuente adaptador de STARLINK mini.</strong> Además contamos con Servicio de Mantenimiento de Consolas, y armado de computadoras según tu necesidad.
        </h1>
      </div>
      <StarlinkMiniBanner />
    </>
  );
}
