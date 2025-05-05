import React from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
const Comparativas = dynamic(() => import ( '../Comparativas'))
import { fuenteOptions } from '../../constants/infoWeb';


const FuentePage = () => {
  return (
    <section className="container mx-auto px-2 md:px-4 py-8">
      <h1 className="text-xl md:text-3xl font-bold text-center mb-6 uppercase text-primary" title='Comparación de Fuentes de Poder'>Comparación de Fuentes de Poder</h1>
      <article className="grid md:grid-cols-3 gap-6">
        {fuenteOptions.map((option, index) => (
          <div key={index} className=" items-center justify-center flex flex-col border rounded-lg p-4 shadow-lg text-center hover:shadow-xl hover:scale-105 hover:shadow-blue-200 hover:transition-all">
            <Image 
              src={option.img} 
              alt={option.alt} 
              className="w-1/2 h-auto object-cover mb-4 rounded-md"
              title={option.alt} 
              aria-label={`Imagen de ${option.title}`}
              loading='lazy'
              width={400}
              height={80}
            />
            <h2 className="text-xl font-semibold mb-2" title={option.title}>{option.title}</h2>
            <p className="text-gray-600">{option.description}</p>
          </div>
        ))}
      </article>
      <article className="grid grid-cols-1 my-6">
        <h2 className="text-xl md:text-3xl font-bold text-center mb-2 text-primary uppercase" title="Diferencias entre Potencias y Certificaciones">Diferencias entre Potencias y Certificaciones</h2>
        <div className="flex flex-col md:flex-row items-center rounded-lg p-4 text-center">
            <Image src="https://res.cloudinary.com/dnbrxpca3/image/upload/v1739456111/comparativa_de_fuentes_fnpewn.webp" alt="Comparación de Fuentes de Poder" className="w-1/2 mb-4 md:mb-0 md:mr-6 rounded-md" title="Comparación de Fuentes de Poder" aria-label="Imagen de comparación de fuentes de poder" loading='lazy' width={600} height={400}/>
            <p className="text-gray-600 text-left" >
              Las fuentes de poder se diferencian en calidad, eficiencia y protección según su certificación:  
              <br /><br />
              ✅ <strong>Fuente Estándar</strong>:  
              <br />- Sin certificación, eficiencia <strong>menor al 80%</strong>.  
              <br />- Mayor pérdida de energía en calor.  
              <br />- Puede tener menor estabilidad y vida útil.  
              <br /><br />
              ✅ <strong>80 PLUS Bronze</strong>:  
              <br />- Eficiencia del <strong>82-85%</strong>.  
              <br />- Menor desperdicio energético, más confiabilidad.  
              <br />- Recomendado para PCs de gaming o trabajo.  
              <br /><br />
              ✅ <strong>80 PLUS Gold</strong>:  
              <br />- Eficiencia del <strong>87-90%</strong>.  
              <br />- Menos consumo eléctrico y mejor refrigeración.  
              <br />- Ideal para estaciones de trabajo y entusiastas.  
              <br /><br />
              🔎 <strong>¿Cuál elegir?</strong>  
              <br />Para PCs básicas, una estándar puede ser suficiente. Pero si buscas eficiencia y estabilidad, una certificada es la mejor opción.
            </p>
        </div>
        <div className="flex flex-col md:flex-row items-center rounded-lg p-4 text-center">
            <p className="text-gray-600 text-left">
            🔹 <strong>Potencia (Watts - W)</strong>  
            <br />Indica cuánta energía puede entregar la fuente. Se recomienda una potencia superior al consumo estimado de los componentes.  
            <br /><br />
            📌 <strong>Ejemplo:</strong>  
            <br />PC Básica → <strong>300-500W</strong>  
            <br />PC Gaming → <strong>600-850W</strong>  
            <br />Workstation → <strong>1000W+</strong>  
            <br /><br />
            💡 <strong>Más potencia permite mejor estabilidad y expansión futura</strong>  
            <br /><br />
            🔹 <strong>Protecciones de Seguridad</strong>  
            <br />Las fuentes de calidad incluyen protecciones contra fallos eléctricos:  
            <br /><br />
            ✅ <strong>OCP</strong>: Protección contra sobrecorriente.  
            <br />✅ <strong>OVP</strong>: Protección contra sobrevoltaje.  
            <br />✅ <strong>UVP</strong>: Protección contra bajo voltaje.  
            <br />✅ <strong>SCP</strong>: Protección contra cortocircuitos.  
            <br />✅ <strong>OTP</strong>: Protección contra sobretemperatura.  
            <br /><br />
            💡 <strong>Una buena fuente protege tus componentes y mejora la durabilidad del equipo.</strong>  
            </p>
        </div>
      </article>
      <Comparativas />
    </section>
  );
};

export default FuentePage;
