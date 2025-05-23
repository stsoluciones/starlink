import React from 'react';
import { shippingOptions } from '../constants/infoWeb';


const EnviosPage = () => {
  return (
      <section id="opciones-envio" aria-labelledby="envio-heading" className="mb-12">
        <h1 id="envio-heading" className="text-3xl font-semibold text-center" title="Opciones de Envío">
          Opciones de Envío de SLS
        </h1>
        <div className="mt-6 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {shippingOptions.map((option) => (
            <div key={option.id} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200">
              <div className="flex flex-col items-center text-center">
                <h2 className="text-xl font-semibold text-gray-700 mb-2" title={option.name}>
                  {option.name}
                </h2>
                <p className="text-gray-600 mb-2" title={option.description}>{option.description}</p>
                {option.cost && (
                  <p className="text-gray-800 font-medium text-lg" title={option.cost}>{option.cost}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
  );
};

export default EnviosPage;
