import React from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { ramOptions } from '../../constants/infoWeb';
const Comparativas = dynamic(() => import ( '../Comparativas'))

const MemoriaRamPage = () => {
  return (
    <section className="container mx-auto px-2 md:px-4 py-8">
      <h1 className="text-xl md:text-3xl font-bold text-center mb-6 uppercase text-primary" title='Comparación de Tipos de Memoria RAM'>Comparación de Tipos de Memoria RAM</h1>
      <article className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {ramOptions.map((option, index) => (
          <div key={index} className="border rounded-lg p-4 shadow-lg text-center hover:shadow-xl hover:scale-105 hover:shadow-blue-200 hover:transition-all">
            <Image 
              src={option.img} 
              alt={option.alt} 
              className="w-full h-auto object-cover mb-4 rounded-md "
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
        <h2 className="text-xl md:text-3xl font-bold text-center mb-2 text-primary uppercase" title="Comparación DDR4 vs DDR5">Comparación DDR4 vs DDR5</h2>
        <div className="flex flex-col md:flex-row items-center rounded-lg p-4 text-center">
              <Image src="https://res.cloudinary.com/dnbrxpca3/image/upload/v1739381195/infografia-memoria-ram-ddr-ddr2-ddr3-ddr4-ddr5_iou9u0.webp" alt="Comparación de Memorias DDR4 y DDR5" className="w-1/2 h-auto mb-4 md:mb-0 md:mr-6 rounded-md" title="Comparación de Memorias DDR4 y DDR5" aria-label="Imagen de comparación de Memorias DDR4 y DDR5" loading='lazy' width={600} height={400}/>
            <p className="text-gray-600 text-left">
              Las memorias RAM DDR4 y DDR5 tienen diferencias clave en velocidad, consumo de energía y capacidad.  
              <br /><br />
              ✅ <strong>DDR4</strong>:  
              <br />- Velocidades entre <strong>2133 y 3200 MHz</strong>.  
              <br />- Mayor compatibilidad con placas base actuales.  
              <br />- Más asequible y suficiente para la mayoría de las aplicaciones.  
              <br /><br />
              ✅ <strong>DDR5</strong>:  
              <br />- Velocidades desde <strong>4800 hasta 7200 MHz</strong>.  
              <br />- Mejor eficiencia energética con menor voltaje.  
              <br />- Mayor ancho de banda y capacidad por módulo.  
              <br /><br />
              🔎 <strong>¿Cuál elegir?</strong>  
              <br />Si buscas una opción confiable y económica, DDR4 es ideal. Pero si quieres lo último en tecnología con mejor rendimiento, DDR5 es la mejor opción.
            </p>
        </div>
        <div className="flex flex-col md:flex-row items-center rounded-lg p-4 text-center">
            <p className="text-gray-600 text-left">
            🔹 <strong>Velocidad (Frecuencia en MHz)</strong>  
            <br />La velocidad de la RAM, medida en megahercios (<strong>MHz</strong>), indica cuántos ciclos por segundo puede ejecutar.  
            <br /><br />
            📌 <strong>Ejemplo:</strong>  
            <br />DDR4-2400 → <strong>2400 MHz</strong>  
            <br />DDR5-5600 → <strong>5600 MHz</strong>  
            <br /><br />
            💡 <strong>Más MHz = Mayor velocidad de transferencia de datos</strong>  
            <br /><br />
            🔹 <strong>Latencia (CL - CAS Latency)</strong>  
            <br />La latencia es el tiempo que tarda la RAM en responder a una solicitud del procesador. Se mide en ciclos de reloj (<strong>CL</strong>), y un número menor significa mejor respuesta.  
            <br /><br />
            📌 <strong>Ejemplo:</strong>  
            <br />CL16 → <strong>16 ciclos de espera</strong>  
            <br />CL18 → <strong>18 ciclos de espera</strong>  
            <br /><br />
            💡 <strong>Menos latencia = Mayor eficiencia y respuesta más rápida</strong>  
            <br /><br />
            🔹 <strong>Capacidad (GB - Gigabytes)</strong>  
            <br />Indica cuánta información puede almacenar temporalmente la RAM para su uso inmediato. Más GB permiten manejar más programas al mismo tiempo sin ralentizar el sistema.  
            <br /><br />
            📌 <strong>Ejemplo:</strong>  
            <br />8GB → <strong>Básico, navegación y tareas de oficina</strong>  
            <br />16GB → <strong>Juegos y edición media</strong>  
            <br />32GB+ → <strong>Edición profesional, renderizado y servidores</strong>  
            <br /><br />
            💡 <strong>Más capacidad = Mejor multitarea y rendimiento en aplicaciones pesadas</strong>  
            </p>
        </div>
      </article>
      <Comparativas />
    </section>
  );
};

export default MemoriaRamPage;