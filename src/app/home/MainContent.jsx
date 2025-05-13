'use client'
import React from 'react';
import Banner from '../../components/Banner/Banner';
import Contact from '../../components/Contact/Contact';
import Sobre from '../../components/SobreMi/Sobre';
import SearchBase from '../../components/Search/SearchBase';
import PreguntasFrecuentes from '../../components/PreguntasFrecuentas/PreguntasFrecuentas';
import Productos from '../../components/Tienda/Productos';
import Header from '../../components/Banner/Header';
import ConsoleCleaningService from '../../components/Productos/Servicios/ServiciosLimpieza';

export default function MainContent() {

  return (
    <main>
      {/* Top part */}
      <Banner />
      <Header />
      {/* <ConsoleCleaningService /> */}
      {/* Middle part */}
      <Sobre />
      <SearchBase />
      <Productos />
      {/* Additional content */}
      <PreguntasFrecuentes />
      <Contact />

      {/* Example: If you want the WhatsApp button in main */}
    </main>
  );
}
