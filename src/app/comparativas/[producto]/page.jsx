import dynamic from "next/dynamic";
import { Suspense } from "react";
import { notFound } from "next/navigation";

const Loading = dynamic(()=>import ('../../../components/Loading/Loading'))
const ClientLayout = dynamic(()=>import ( '../../ClientLayout'))


// Mapeo de los componentes según el producto
const comparisonComponents = {
  almacenamiento: dynamic(() => import("../../../components/Comparativas/Almacenamiento/AlmacenamientoPage")),
  memoria: dynamic(() => import("../../../components/Comparativas/MemoriaRam/MemoriaRamPage")),
  fuente: dynamic(() => import("../../../components/Comparativas/Fuentes/FuentePage")),
  mothers: dynamic(() => import("../../../components/Comparativas/Mother/MothersPage")),

};

const ComparativaPage = ({ params }) => {
  const { producto } = params;

  // Si el producto no existe en el mapeo, devuelve un 404
  if (!comparisonComponents[producto]) {
    notFound();
  }

  const SelectedComponent = comparisonComponents[producto];

  return (
      <ClientLayout>
          <main className="flex-1 flex items-center justify-center bg-white">
            <Suspense fallback={<Loading />}>
              <SelectedComponent />
            </Suspense>
          </main>
      </ClientLayout>
  );
};

export default ComparativaPage;


// Genera las rutas estáticas para cada tipo de comparación
export async function generateStaticParams() {
  return [
    { producto: "almacenamiento" },
    { producto: "memoria" },
    { producto: "fuente" },
    { producto: "mothers" },
  ];
}

// Configura la revalidación (ISR) en segundos (en este caso, 14400 segundos = 4 horas)
export const revalidate = 14400;