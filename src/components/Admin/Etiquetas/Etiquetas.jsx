'use client'

import React, { useState, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import userData from '../../constants/userData';
import CargarEmpresaModal from '../Comprobantes/CargarEmpresa';
import useEmpresas from '../../../Hooks/useEmpresas';
import { Buttons } from '../../ui/Buttons';
import Image from 'next/image';

// Etiqueta individual
function Etiqueta({ data }) {
  return (
    <div
      className="etiqueta w-[148mm] h-[98mm] border border-black p-2 rounded-md text-lg font-medium m-1"
      style={{ boxSizing: 'border-box' }}
    >
      {/* Encabezado */}
      <div className="bg-orange-500 text-white text-lg font-bold p-1 flex justify-between items-center uppercase rounded-md">
        <span>ENVÍO</span>
        <Image 
          src="/logos/logo.webp" 
          className="h-10" 
          unoptimized={true}
          width={40}
          height={40} 
          title='Logo Web' 
          alt='Logo Web' 
          aria-label='logo Web' 
        />
      </div>

      {/* Cuerpo */}
      <div className="grid grid-cols-3 mt-2 text-base uppercase">
        <div className="col-span-2 space-y-1">
          <p><strong>Para:</strong> {data.para}</p>
          <p><strong>Dirección:</strong> {data.direccion}</p>
          <p><strong>Tel:</strong> {data.telefono}</p>
          <p><strong>Cuil:</strong> {data.cuil}</p>
        </div>
        <div className="col-span-1 space-y-1">
          <p><strong>De:</strong> {data.de}</p>
          <p><strong>Cel:</strong> {data.cel}</p>
        </div>
      </div>

      <div className="mt-2 text-base uppercase">
        <p><strong>Despachar por:</strong> {data.despacharPor}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2 text-lg uppercase">
        <p><strong>Bultos total:</strong> {data.totalBulto}</p>
        <p><strong>Bulto N°:</strong> {data.bultoN}</p>
      </div>

      <div className="mt-2 text-base">
        <p><strong>Observaciones:</strong> {data.observaciones}</p>
      </div>
    </div>
  );
}

// Formulario principal
export default function EtiquetaFormPDF() {
  const [formData, setFormData] = useState({
    de: userData.name,
    cel: userData.contact,
    para: '',
    direccion: '',
    telefono: '',
    cuil: '',
    tipo: '',
    totalBulto: '',
    despacharPor: '',
    bultoN: '',
    observaciones: '',
  });

  const { empresas } = useEmpresas();
  const etiquetaRef = useRef();

  const [empresa, setEmpresa] = useState({
    nombre: '',
    direccion: '',
    mail: '',
    telefono: '',
    cuil: '',
    observaciones: '',
    tipo: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGeneratePDF = () => {
    const element = etiquetaRef.current;

    const opt = {
      margin: 0,
      filename: `etiquetas-${formData.para || 'sin-nombre'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: 'mm',
        format: [150, 100],
        orientation: 'landscape',
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save();
  };

  const totalBultos = parseInt(formData.totalBulto, 10);
  const isValidTotal = !isNaN(totalBultos) && totalBultos > 0;

  const handleClean = () => {
    setFormData({
      de: userData.name,
      cel: userData.contact,
      para: '',
      direccion: '',
      telefono: '',
      cuil: '',
      tipo: '',
      totalBulto: '',
      despacharPor: '',
      bultoN: '',
      observaciones: '',
    });
    setEmpresa({
      nombre: '',
      direccion: '',
      mail: '',
      telefono: '',
      cuil: '',
      observaciones: '',
      tipo: ''
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 m-2">
        <CargarEmpresaModal
          empresas={empresas}
          onEmpresaSeleccionada={(empresaSeleccionada) => {
            setEmpresa(empresaSeleccionada);
            setFormData((prev) => ({
              ...prev,
              para: empresaSeleccionada.nombre,
              direccion: empresaSeleccionada.direccion,
              telefono: empresaSeleccionada.telefono,
              cuil: empresaSeleccionada.cuil,
              tipo: empresaSeleccionada.tipo,
              observaciones: empresaSeleccionada.observaciones,
            }));
          }}
        />
        <Buttons onClick={handleClean} className="bg-primary text-white uppercase">
          Limpiar etiqueta
        </Buttons>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-2 px-2">
        {Object.keys(formData).map((key) =>
          key !== 'bultoN' ? (
            <input
              key={key}
              type="text"
              name={key}
              placeholder={key.toUpperCase()}
              value={formData[key]}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              disabled={key === 'de' || key === 'cel'}
            />
          ) : null
        )}
      </form>

      <button
        onClick={handleGeneratePDF}
        className="bg-primary text-white px-4 py-2 rounded cursor-pointer"
        disabled={!isValidTotal}
      >
        Generar PDF
      </button>

      <div ref={etiquetaRef} className="print-container">
        {isValidTotal &&
          Array.from({ length: totalBultos }).map((_, i) => (
            <Etiqueta key={i} data={{ ...formData, bultoN: i + 1 }} />
          ))}
      </div>
    </div>
  );
}
