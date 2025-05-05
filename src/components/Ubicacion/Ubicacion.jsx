'use client';
import React from 'react';

const Ubicacion = () => {
    return (
<section id="ubicacion" className="mx-auto max-w-2xl py-10 px-4 lg:max-w-7xl lg:px-8">
  <article className='flex flex-col items-center justify-center py-2 m-2 w-full'>
    <h2 className="mb-8 text-3xl md:text-4xl text-center font-extrabold text-primary uppercase">
      ¿Dónde nos encontrás?
    </h2>
    <div className="w-full relative aspect-video bg-gray-200">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3280.507540032189!2d-58.30346882425594!3d-34.69237647292265!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95a33362e201a62d%3A0x1cc2d66dad49ac4e!2sCentro%20Comercial%20Wilde!5e0!3m2!1ses-419!2sar!4v1736620131254!5m2!1ses-419!2sar"
        allowFullScreen={true}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Ubicación de Local"
        className="absolute inset-0 w-full h-full border-0"
      ></iframe>
    </div>
  </article>
</section>

    );
};

export default Ubicacion;
