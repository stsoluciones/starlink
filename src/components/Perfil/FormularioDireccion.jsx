import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useState } from 'react';

const schemaDireccion = yup.object().shape({
  retiraPersona: yup.boolean(),
  pais: yup.string().when('retiraPersona', {
    is: false,
    then: (schema) => schema.required('El país es obligatorio'),
    otherwise: (schema) => schema.notRequired(),
  }),
  provincia: yup.string().when('retiraPersona', {
    is: false,
    then: (schema) => schema.required('La provincia es obligatoria'),
    otherwise: (schema) => schema.notRequired(),
  }),
  ciudad: yup.string().when('retiraPersona', {
    is: false,
    then: (schema) => schema.required('La ciudad es obligatoria'),
    otherwise: (schema) => schema.notRequired(),
  }),
  calle: yup.string().when('retiraPersona', {
    is: false,
    then: (schema) => schema.required('La calle es obligatoria'),
    otherwise: (schema) => schema.notRequired(),
  }),
  numero: yup.string().when('retiraPersona', {
    is: false,
    then: (schema) => schema.required('El número es obligatorio'),
    otherwise: (schema) => schema.notRequired(),
  }),
  casaOTorre: yup.string().notRequired(),
  piso: yup.string().notRequired(),
  depto: yup.string().notRequired(),
  telefono: yup.string()
    .matches(/^\+?\d{7,15}$/, 'Teléfono inválido')
    .required('El teléfono es obligatorio'),
  codigoPostal: yup.string().when('retiraPersona', {
    is: false,
    then: (schema) => schema.matches(/^\d{4,5}$/, 'Código postal inválido').required('El código postal es obligatorio'),
    otherwise: (schema) => schema.notRequired(),
  }),
  entreCalles: yup.string().notRequired(),
  referencia: yup.string().notRequired(),
});

export default function FormularioDireccion({ onSubmit, onCancel }) {
  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm({
    resolver: yupResolver(schemaDireccion),
    defaultValues: {
      retiraPersona: false,
      pais: 'Argentina',
      provincia: '',
      ciudad: '',
      calle: '',
      numero: '',
      casaOTorre: '',
      piso: '',
      depto: '',
      telefono: '',
      entreCalles: '',
      codigoPostal: '',
      referencia: '',
    },
    mode: 'onChange' 
  });

  const retiraPersona = watch('retiraPersona');

  const handleFormSubmit = (data) => {
    if (data.retiraPersona) {
      // Si es retiro en persona, rellenar con datos predeterminados
      const dataRetiro = {
        ...data,
        pais: 'Argentina',
        provincia: 'Buenos Aires',
        ciudad: 'Quilmes',
        calle: 'Retiro en persona',
        numero: '123',
        codigoPostal: '1878',
        casaOTorre: '',
        piso: '',
        depto: '',
        entreCalles: '',
        referencia: 'Retiro en persona en Quilmes, Buenos Aires',
      };
      onSubmit(dataRetiro);
    } else {
      onSubmit(data);
    }
  };

  // Campos obligatorios según el esquema
  const requiredFields = ['pais', 'provincia', 'ciudad', 'calle', 'numero', 'telefono', 'codigoPostal']

  return (
    <div className="p-6 bg-white rounded-xl max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 uppercase">Dirección de Envío</h2>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 uppercase">

        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <label className="flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              {...register('retiraPersona')} 
              className="mr-2 h-5 w-5 cursor-pointer"
            />
            <span className="font-semibold text-blue-700">Retiro en persona en Quilmes, Buenos Aires</span>
          </label>
          {retiraPersona && (
            <p className="text-sm mt-2 text-gray-600">Podrás retirar tu pedido en Quilmes, Buenos Aires. Te contactaremos para coordinar.</p>
          )}
        </div>

        {!retiraPersona && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm">{requiredFields.includes('pais') && <span className="text-red-500 mr-1">*</span>}País</label>
                <input {...register('pais')} className="w-full border rounded p-2" />
                {errors.pais && <p className="text-red-500 text-sm">{errors.pais.message}</p>}
              </div>
              <div>
                <label className="block text-sm">{requiredFields.includes('provincia') && <span className="text-red-500 mr-1">*</span>}Provincia</label>
                <input {...register('provincia')} className="w-full border rounded p-2" />
                {errors.provincia && <p className="text-red-500 text-sm">{errors.provincia.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm">{requiredFields.includes('ciudad') && <span className="text-red-500 mr-1">*</span>}Localidad</label>
                <input {...register('ciudad')} className="w-full border rounded p-2" />
                {errors.ciudad && <p className="text-red-500 text-sm">{errors.ciudad.message}</p>}
              </div>
              <div>
                <label className="block text-sm">{requiredFields.includes('calle') && <span className="text-red-500 mr-1">*</span>}Calle</label>
                <input {...register('calle')} className="w-full border rounded p-2" />
                {errors.calle && <p className="text-red-500 text-sm">{errors.calle.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm">{requiredFields.includes('numero') && <span className="text-red-500 mr-1">*</span>}Número</label>
                <input {...register('numero')} className="w-full border rounded p-2" />
                {errors.numero && <p className="text-red-500 text-sm">{errors.numero.message}</p>}
              </div>
              <div>
                <label className="block text-sm">{requiredFields.includes('casaOTorre') && <span className="text-red-500 mr-1">*</span>}Casa / Torre</label>
                <input {...register('casaOTorre')} className="w-full border rounded p-2" />
                {errors.casaOTorre && <p className="text-red-500 text-sm">{errors.casaOTorre.message}</p>}
              </div>
              <div>
                <label className="block text-sm">{requiredFields.includes('piso') && <span className="text-red-500 mr-1">*</span>}Piso</label>
                <input {...register('piso')} className="w-full border rounded p-2" />
                {errors.piso && <p className="text-red-500 text-sm">{errors.piso.message}</p>}
              </div>
              <div>
                <label className="block text-sm">{requiredFields.includes('depto') && <span className="text-red-500 mr-1">*</span>}Depto</label>
                <input {...register('depto')} className="w-full border rounded p-2" />
                {errors.depto && <p className="text-red-500 text-sm">{errors.depto.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm">{requiredFields.includes('codigoPostal') && <span className="text-red-500 mr-1">*</span>}Cód. Postal</label>
                <input {...register('codigoPostal')} className="w-full border rounded p-2" />
                {errors.codigoPostal && <p className="text-red-500 text-sm">{errors.codigoPostal.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div>
                <label className="block text-sm">{requiredFields.includes('entreCalles') && <span className="text-red-500 mr-1">*</span>}Entre Calles</label>
                <input {...register('entreCalles')} className="w-full border rounded p-2" />
                {errors.entreCalles && <p className="text-red-500 text-sm">{errors.entreCalles.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
                <label className="block text-sm">{requiredFields.includes('referencia') && <span className="text-red-500 mr-1">*</span>}Otra informacion importante para el envio</label>
                <input {...register('referencia')} className="w-full border rounded p-2" />
                {errors.referencia && <p className="text-red-500 text-sm">{errors.referencia.message}</p>}
            </div>
          </>
        )}

        <div className="grid grid-cols-1 gap-2 mt-4">
          <div>
            <label className="block text-sm"><span className="text-red-500 mr-1">*</span>Teléfono</label>
            <input {...register('telefono')} className="w-full border rounded p-2" />
            {errors.telefono && <p className="text-red-500 text-sm">{errors.telefono.message}</p>}
          </div>
        </div>

        <div className="flex justify-between mt-4 text-base">
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-red-500 rounded hover:bg-red-500 text-white">
            Cancelar
          </button>
          <button type="submit" className={`px-4 py-2 text-white rounded ${isValid ? 'bg-primary hover:bg-primary-hover' : 'bg-gray-400 cursor-not-allowed'}`} disabled={!isValid}>
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
