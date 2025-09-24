'use client';

import React, { useRef, Suspense, useEffect, useState } from "react";
import Flicking, { ViewportSlot } from "@egjs/react-flicking";
import { Arrow } from "@egjs/flicking-plugins";
import "@egjs/react-flicking/dist/flicking.css";
import "@egjs/flicking-plugins/dist/arrow.css";
import SkeletonDestacado from "../Tienda/Card/SkeletonDestacados";
import CardDestacado from "../Tienda/Card/CardDestacado";
import Modals from "../Tienda/Modal/Modals";
import Loading from "../Loading/Loading";
import useProducts from "../../Hooks/useProducts";

const Destacados = () => {
  const flickingRef = useRef(null);
  const pluginsRef = useRef([new Arrow()]);
  const {
  isModalOpen,
  closeModal,
  selectedProduct,
  handleProductSelect,
  } = useProducts();
  const [allDestacados, setAllDestacados] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchDestacados() {
  try {
    const res = await fetch('/api/findDescatacados');
    if (!res.ok) throw new Error('Error fetching data');
    const data = await res.json({});
    return data.productos;
  } catch (error) {
    console.error('Error fetching destacados:', error);
    return [];
  }
  }

  useEffect(() => {
  const getDestacados = async () => {
    setIsLoading(true);
    const data = await fetchDestacados();
    setAllDestacados(data);
    setIsLoading(false);
  };
  getDestacados();
  }, []);

  // Generar contenido del slider
  const renderSliderContent = () => {
  if (isLoading) {
    return Array.from({ length: 4 }, (_, index) => (
    <div key={index} className="flicking-panel m-8 transition-transform transform hover:scale-105 w-64 p-6">
      <SkeletonDestacado />
    </div>
    ));
  }
  if (allDestacados.length === 0) return null;
  return allDestacados.map((item, i) => (
    <div key={i} className="flicking-panel m-8 transition-transform transform hover:scale-105 w-64 p-6">
    <CardDestacado selectedProduct={item} handleProductSelect={handleProductSelect} />
    </div>
  ));
  };

  //console.log('allDestacados', allDestacados );
  return (
  <Suspense fallback={<Loading />}>
    <section className="text-center max-w-7xl mx-auto" id="marcasDestacado">
    <h2 className="mt-4 text-xl md:text-2xl lg:text-3xl xl:text-4xl text-center font-extrabold text-primary uppercase ">
      Productos Destacados
    </h2>
    {isModalOpen && selectedProduct && (
      <Modals closeModal={closeModal} selectedProduct={selectedProduct} />
    )}
    {allDestacados.length > 0 && (
      <Flicking
      circular
      ref={flickingRef}
      plugins={pluginsRef.current}
      defaultIndex={Math.floor(allDestacados.length / 3)}
      className="flex overflow-hidden whitespace-nowrap"
      >
      <ViewportSlot>
        <span className="flicking-arrow-prev rounded-full"></span>
        <span className="flicking-arrow-next"></span>
      </ViewportSlot>
      {renderSliderContent()}
      </Flicking>
    )}
    </section>
  </Suspense>
  );
};

export default Destacados;