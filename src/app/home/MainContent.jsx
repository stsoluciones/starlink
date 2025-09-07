"use client"
import React from 'react';
// import Banner from '../../components/Banner/Banner';
import SliderBanner from '../../components/Banner/SliderBanner';
import Contact from '../../components/Contact/Contact';
//import Sobre from '../../components/SobreMi/Sobre';
import SearchBase from '../../components/Search/SearchBase';
import PreguntasFrecuentes from '../../components/PreguntasFrecuentas/PreguntasFrecuentas';
import Productos from '../../components/Tienda/Productos';
// import Header from '../../components/Banner/Header';
// import ProductGallery from '../../components/Productos/Starlink/ProductGallery';
import Destacados from '../../components/Destacados/Destacados';

export default function MainContent() {

  return (
    <main>
      {/* Top part */}
      <SliderBanner />
      <Destacados />
      {/* <Banner /> */}
      {/* Middle part */}
      {/* <Header /> */}
      {/* <ProductGallery /> */}
      {/* <Sobre /> */}
      <SearchBase />
      <Productos />
      {/* Additional content */}
      <PreguntasFrecuentes />
      <Contact />

      {/* Example: If you want the WhatsApp button in main */}
    </main>
  );
}
