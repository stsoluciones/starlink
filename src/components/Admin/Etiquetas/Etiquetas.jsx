import React, { useState, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import userData from '../../constants/userData';
import CargarEmpresaModal from '../Comprobantes/CargarEmpresa';
import useEmpresas from '../../../Hooks/useEmpresas'
import { Buttons } from '../../ui/Buttons';


function Etiquetas({ data }) {
  return (
    <div className="w-[20cm] h-[9.4cm] border border-primary p-2 rounded-md text-xl font-medium gap-2 m-2">
      {/* Encabezado */}
      <div className="bg-primary text-white text-2xl font-bold p-2 flex justify-around items-center rounded-md uppercase text-center">
        <span>ENVÍO</span>
        <img src="/logos/logo.webp" className="h-12 rounded-lg" />
      </div>

      {/* Cuerpo en dos columnas */}
      <div className="grid grid-cols-3 gap-2 mt-2 px-2 text-2xl uppercase">
        {/* Columna izquierda */}
        <div className="space-y-1 col-span-2">
          <p><strong>Para:</strong> {data.para}</p>
          <p><strong>Dirección:</strong> {data.direccion}</p>
          <p><strong>Tel:</strong> {data.telefono}</p>
          <p><strong>Cuil:</strong> {data.cuil}</p>
        </div>

        {/* Columna derecha */}
        <div className="space-y-1">
          <p><strong>De:</strong> {data.de}</p>
          <p><strong>Cel:</strong> {data.cel}</p>
        </div>
      </div>

      {/* Información adicional inferior */}
      <div className="grid col-span-3 gap-2 mt-2 px-2 text-2xl uppercase">
        <p><strong>Despachar por:</strong> {data.despacharPor}</p>
      </div>

      {/* Kilos y Bulto N° */}
      <div className="grid grid-cols-2 gap-2 mt-2 px-2 text-2xl uppercase">
        <p><strong>Bultos <small>total</small>:</strong> {data.totalBulto}</p>
        <p><strong>Bulto N°:</strong>{data.bultoN}</p>
      </div>
      <div className="grid grid-cols-1 gap-2 mt-2 px-2 text-base">
        <p><strong>Observaciones: </strong>{data.observaciones}</p>
      </div>
    </div>
  );
}


export default function EtiquetaFormPDF() {
    const [formData, setFormData] = useState({
        de: userData.name,
        cel: userData.contact,
        para: '',
        direccion:'',
        telefono:'',
        cuil: '',
        tipo: '',
        totalBulto: '',
        despacharPor: '',
        bultoN: '',
        observaciones:'',
    });
    const { empresas } = useEmpresas()
    const [empresa, setEmpresa] = useState({
      nombre: '',
      direccion: '',
      mail: '',
      telefono: '',
      cuil: '',
      observaciones:'',
      tipo: ''
    })

  const etiquetaRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGeneratePDF = () => {
    html2pdf().from(etiquetaRef.current).set({
      margin: 0,
      filename: `etiquetas-${formData.para || 'sin-nombre'}.pdf`,
      jsPDF: { unit: 'cm', format: 'a4' },
    }).save();
  };

  const totalBultos = parseInt(formData.totalBulto, 10);
  const isValidTotal = !isNaN(totalBultos) && totalBultos > 0;

  const handleClean = () => {
    setFormData({
        de: userData.name,
        cel: userData.contact,
        para: '',
        direccion:'',
        telefono:'',
        totalBulto: '',
        despacharPor: '',
        bultoN: '',
        cuil:'',
        observaciones:'',
    });
    setEmpresa({
      nombre: '',
      direccion: '',
      mail: '',
      telefono: '',
      cuil: '',
      observaciones:'',
      tipo: ''
    })
  }
  return (
    <div className="space-y-4">
        <div className="flex gap-2 m-2">
            <CargarEmpresaModal empresas={empresas}
                onEmpresaSeleccionada={(empresaSeleccionada) => {
                    setEmpresa({
                        nombre: empresaSeleccionada.nombre,
                        direccion: empresaSeleccionada.direccion,
                        mail: empresaSeleccionada.mail,
                        telefono: empresaSeleccionada.telefono,
                        cuil: empresaSeleccionada.cuil,
                        tipo: empresaSeleccionada.tipo,
                        observaciones: empresaSeleccionada.observaciones,
                    });
                    setFormData((prev) => ({
                        ...prev,
                        para: empresaSeleccionada.nombre,
                        direccion: empresaSeleccionada.direccion,
                        telefono: empresaSeleccionada.telefono,
                        cuil: empresaSeleccionada.cuil,
                        tipo: empresaSeleccionada.tipo,
                        observaciones: empresaSeleccionada.observaciones,
                    }))
                }} />
                <Buttons onClick={handleClean} className='bg-primary text-white uppercase'>Limpiar etiqueta</Buttons>
        </div>
      <form className="flex flex-wrap md:grid md:grid-cols-2 gap-4">
      {Object.keys(formData).map((key) => (
        key !== 'bultoN' ?
        <input
            key={key}
            type="text"
            name={key}
            placeholder={key.toUpperCase()}
            value={formData[key]}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            disabled={key === 'de' || key === 'cel'}
        />:null
        ))}
        <div className="flex items-center gap-2">
    </div>
      </form>
      <button onClick={handleGeneratePDF} className="bg-primary text-white px-2 py-2 rounded cursor-pointer" disabled={!isValidTotal} >
        Generar PDF
      </button>
      <div ref={etiquetaRef} className='flex flex-wrap'>
        {isValidTotal &&
          Array.from({ length: totalBultos }).map((_, i) => (
            <Etiquetas key={i} data={{ ...formData, bultoN: i + 1 }} />
          ))}
      </div>
    </div>
  );
}
