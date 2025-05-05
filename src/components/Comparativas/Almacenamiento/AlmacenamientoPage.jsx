import React from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { storageOptions } from '../../constants/infoWeb';
const Comparativas = dynamic(() => import('../Comparativas'))

const AlmacenamientoPage = () => {

  return (
    <section className="container mx-auto px-2 md:px-4 py-8">
      <h1 className="text-xl md:text-3xl font-bold text-center mb-6 uppercase text-primary" title='Comparación de Dispositivos de Almacenamiento'>Comparación de discos almacenamiento HDD y SSD</h1>
      <article className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {storageOptions.map((option, index) => (
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
        <h2 className="text-xl md:text-3xl font-bold text-center mb-2 text-primary uppercase" title="Comparación de Dispositivos de Almacenamiento">Comparación de discos SSD M.2 SATA y M.2 NVMe</h2>
        <div className="flex flex-col md:flex-row items-center rounded-lg p-4 text-center">
            <Image src="https://res.cloudinary.com/dnbrxpca3/image/upload/v1739372328/Almacenamiento_M.2_comparativa_krya8x.webp" alt="Comparación de discos SSD M.2 SATA y M.2 NVMe" className="w-1/2 mb-4 md:mb-0 md:mr-6 rounded-md" title="Comparación de discos SSD M.2 SATA y M.2 NVMe" aria-label="Imagen de comparación de discos SSD M.2 SATA y M.2 NVMe" loading='lazy' width={400} height={100}/>
            <p className="text-gray-600 text-left">
              Los SSD M.2 SATA y M.2 NVMe son dos tipos de almacenamiento en estado sólido con diferencias clave en rendimiento y compatibilidad.  
              <br /><br />
              ✅ <strong>SSD M.2 SATA</strong>:  
              <br />- Utiliza la interfaz SATA, con una velocidad máxima de <strong>550 MB/s</strong>.  
              <br />- Es más económico y compatible con la mayoría de las computadoras con ranura M.2.  
              <br />- Ideal para quienes buscan mejorar el rendimiento sin un gran costo.  
              <br /><br />
              ✅ <strong>SSD M.2 NVMe</strong>:  
              <br />- Utiliza la interfaz PCIe y el protocolo NVMe, alcanzando velocidades de hasta <strong>7000 MB/s</strong>.  
              <br />- Ofrece tiempos de carga más rápidos en juegos y aplicaciones exigentes.  
              <br />- Requiere compatibilidad con NVMe en la placa base.  
              <br /><br />
              🔎 <strong>¿Cuál elegir?</strong>  
              <br />Si buscas una opción accesible y confiable, el SSD M.2 SATA es ideal. Pero si necesitas el máximo rendimiento para tareas como edición de video, gaming o servidores, el SSD M.2 NVMe es la mejor elección.
            </p>
        </div>
        </article>
        <Comparativas />
    </section>
  );
};

export default AlmacenamientoPage;
