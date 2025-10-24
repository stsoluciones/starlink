"use client"
import React from 'react';
// import Banner from '../../components/Banner/Banner';
import SliderBanner from '../../components/Banner/SliderBanner';
import SearchBase from '../../components/Search/SearchBase';
//import Contact from '../../components/Contact/Contact';
//import Sobre from '../../components/SobreMi/Sobre';
//import PreguntasFrecuentes from '../../components/PreguntasFrecuentas/PreguntasFrecuentas';
//import Productos from '../../components/Tienda/Productos';
// import Header from '../../components/Banner/Header';
// import ProductGallery from '../../components/Productos/Starlink/ProductGallery';
//import Destacados from '../../components/Destacados/Destacados';
import Loading from '../../components/Loading/Loading';

export default function MainContent() {

  // Carga diferida de componentes pesados
  const Destacados = React.lazy(() => import('../../components/Destacados/Destacados'));
  const Productos = React.lazy(() => import('../../components/Tienda/Productos'));
  const PreguntasFrecuentes = React.lazy(() => import('../../components/PreguntasFrecuentas/PreguntasFrecuentas'));
  const Contact = React.lazy(() => import('../../components/Contact/Contact'));

  return (
    <main>
      {/* Top part */}
      <SliderBanner />
      <React.Suspense fallback={<Loading/>}>
        <Destacados />
        <SearchBase />
        <Productos />
        <PreguntasFrecuentes />
        <Contact />
      </React.Suspense>
      {/* Example: If you want the WhatsApp button in main */}
    </main>
  );
}
