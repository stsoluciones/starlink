import React from 'react';
import dynamic from 'next/dynamic';
import { motherboardData } from '../../constants/infoWeb';
const Comparativas = dynamic(() => import('../Comparativas'));


const MothersPage = () => {
  return (
    <section className="container mx-auto px-2 md:px-4 py-8">
      <h1 className="text-xl md:text-3xl font-bold text-center mb-6 uppercase text-primary" title='Comparación de Placas Madre Intel y AMD'>Comparación de Placas Madre Intel y AMD</h1>
      <section className="container mx-auto px-2 md:px-4 py-8">        
        <article className="grid md:grid-cols-2 gap-6">
          <div className="border p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-center text-primary">Sockets y Chipsets Intel</h2>
            <p className="text-sm md:text-base mt-2"><strong>Sockets:</strong> {motherboardData.intel.sockets.join(', ')}</p>
            <p className="text-sm md:text-base mt-2"><strong>Chipsets:</strong> {motherboardData.intel.chipsets.join(', ')}</p>
            <p className="text-sm md:text-base mt-2"><strong>Compatibilidad:</strong> {motherboardData.intel.compatibility}</p>
          </div>
          <div className="border p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-center text-primary">Sockets y Chipsets AMD</h2>
            <p className="text-sm md:text-base mt-2"><strong>Sockets:</strong> {motherboardData.amd.sockets.join(', ')}</p>
            <p className="text-sm md:text-base mt-2"><strong>Chipsets:</strong> {motherboardData.amd.chipsets.join(', ')}</p>
            <p className="text-sm md:text-base mt-2"><strong>Compatibilidad:</strong> {motherboardData.amd.compatibility}</p>
          </div>
        </article>
        <article className="mt-6 border p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-center text-primary">Explicación de los Chipsets</h2>
          <p className="text-sm md:text-base mt-2"><strong>Intel:</strong> {motherboardData.chipsetExplanation.intel}</p>
          <p className="text-sm md:text-base mt-2"><strong>AMD:</strong> {motherboardData.chipsetExplanation.amd}</p>
        </article>
        
        <article className="mt-6 border p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-center text-primary">Factores de Forma</h2>
          <ul className="text-sm md:text-base mt-2 list-disc pl-5">
            {Object.entries(motherboardData.formFactors).map(([key, value]) => (
              <li key={key} className="mt-2">
                <strong>{key}:</strong> {value}
              </li>
            ))}
          </ul>
        </article>
        
        <article className="mt-6 border p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-center text-primary">Características Adicionales</h2>
          <ul className="text-sm md:text-base mt-2 list-disc pl-5">
            {Object.entries(motherboardData.additionalFeatures).map(([key, value]) => (
              <li key={key} className="mt-2">
                <strong>{key.replace(/([A-Z])/g, ' $1').trim()}:</strong> {value}
              </li>
            ))}
          </ul>
        </article>
      </section>
      <Comparativas />
    </section>
  );
};

export default MothersPage;
