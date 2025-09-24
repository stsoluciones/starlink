'use client'
import React, { useRef, useEffect, useMemo, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import SkeletonDestacado from '../Tienda/Card/SkeletonDestacados';
import CardDestacado from '../Tienda/Card/CardDestacado';
import Modals from '../Tienda/Modal/Modals';
import Loading from '../Loading/Loading';
import useProducts from '../../Hooks/useProducts';

// ⬇️ Import dinámico de Flicking (reduce JS inicial)
const Flicking = dynamic(() => import('@egjs/react-flicking'), {
  ssr: false,
  loading: () => <div className="py-8">Cargando carrusel…</div>,
});

// Tip: creamos Arrow plugin sólo cuando lo necesitamos
const useArrowPlugin = (enabled: boolean) => {
  return useMemo(() => {
    if (!enabled) return [];
    // import diferido del plugin para no bloquear el paint
    const { Arrow } = require('@egjs/flicking-plugins');
    return [new Arrow()];
  }, [enabled]);
};

const Destacados = () => {
  const flickingRef = useRef<any>(null);

  const { isModalOpen, closeModal, selectedProduct, handleProductSelect } = useProducts();

  const [allDestacados, setAllDestacados] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false); // ⬅️ sólo montar carrusel cuando entra a viewport
  const [hasMounted, setHasMounted] = useState(false); // evita hidratación doble

  // Sólo activamos plugins cuando el carrusel realmente se renderiza
  const plugins = useArrowPlugin(isVisible && allDestacados.length > 0);

  // ✅ FIX: res.json() (sin objeto)
  async function fetchDestacados(signal?: AbortSignal) {
    try {
      // Ideal: que tu ruta /api/findDescatacados tenga revalidate del lado del servidor
      const res = await fetch('/api/findDescatacados', { signal, cache: 'no-store' });
      if (!res.ok) throw new Error('Error fetching data');
      const data = await res.json();
      return Array.isArray(data?.productos) ? data.productos : [];
    } catch (err) {
      if ((err as any)?.name !== 'AbortError') console.error('Error fetching destacados:', err);
      return [];
    }
  }

  // 🔎 Observa el bloque para activar carga diferida
  useEffect(() => {
    setHasMounted(true);
    const section = document.getElementById('marcasDestacado');
    if (!section) return;

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e.isIntersecting) {
          setIsVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px 0px' } // preactiva un poco antes
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  // ⬇️ Traemos datos recién cuando es visible
  useEffect(() => {
    if (!isVisible) return;
    const ac = new AbortController();
    (async () => {
      setIsLoading(true);
      const data = await fetchDestacados(ac.signal);
      setAllDestacados(data);
      setIsLoading(false);
    })();
    return () => ac.abort();
  }, [isVisible]);

  const renderSliderContent = () => {
    if (isLoading) {
      return Array.from({ length: 4 }, (_, index) => (
        <div
          key={`sk-${index}`}
          className="flicking-panel m-8 transition-transform transform hover:scale-105 w-64 p-6"
        >
          <SkeletonDestacado />
        </div>
      ));
    }

    if (!allDestacados.length) {
      return (
        <div className="m-8 w-full text-center text-gray-500">
          No hay productos destacados en este momento.
        </div>
      );
    }

    return allDestacados.map((item, i) => (
      <div
        key={item?._id ?? i}
        className="flicking-panel m-8 transition-transform transform hover:scale-105 w-64 p-6"
      >
        <CardDestacado selectedProduct={item} handleProductSelect={handleProductSelect} />
      </div>
    ));
  };

  return (
    <Suspense fallback={<Loading />}>
      <section className="text-center max-w-7xl mx-auto" id="marcasDestacado">
        <h2 className="mt-4 text-xl md:text-2xl lg:text-3xl xl:text-4xl text-center font-extrabold text-primary uppercase">
          Productos Destacados
        </h2>

        {isModalOpen && selectedProduct && (
          <Modals closeModal={closeModal} selectedProduct={selectedProduct} />
        )}

        {/* Montamos el carrusel SOLO cuando el bloque es visible y el componente ya montó en cliente */}
        {hasMounted && isVisible ? (
          allDestacados.length > 0 || isLoading ? (
            <Flicking
              circular
              ref={flickingRef}
              plugins={plugins}
              className="flex overflow-hidden whitespace-nowrap"
              // Evita un “salto” de layout inicial caro
              renderOnlyVisible={true}
              autoResize={true}
              // defaultIndex al medio puede costar si hay muchos items;
              // mejor al inicio y dejar que el usuario navegue:
              defaultIndex={0}
            >
              {/* Flechas */}
              <span className="flicking-arrow-prev rounded-full" />
              <span className="flicking-arrow-next" />

              {/* Panels */}
              {renderSliderContent()}
            </Flicking>
          ) : null
        ) : (
          // Placeholder ultra liviano antes de intersecar
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 px-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonDestacado key={`pre-${i}`} />
            ))}
          </div>
        )}
      </section>
    </Suspense>
  );
};

export default Destacados;
