'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input } from '../ui/input';

// Esquema de validación
const envioSchema = yup.object().shape({
  nombreCompleto: yup.string().required('El nombre completo es requerido'),
  dniOCuit: yup.string()
    .matches(/^[0-9]+$/, 'DNI/CUIT debe contener solo números')
    .test('len', 'DNI debe tener 7-8 dígitos o CUIT 11 dígitos', val => {
      if (!val) return true;
      return val.length === 7 || val.length === 8 || val.length === 11;
    }),
  telefono: yup.string()
    .matches(/^[0-9]+$/, 'Teléfono debe contener solo números')
    .min(8, 'Teléfono debe tener al menos 8 dígitos'),
  direccion: yup.object().shape({
    pais: yup.string().required('El país es requerido'),
    provincia: yup.string().required('La provincia es requerida'),
    ciudad: yup.string().required('La ciudad es requerida'),
    calle: yup.string().required('La calle es requerida'),
    numero: yup.string().required('El número es requerido'),
    codigoPostal: yup.string().required('El código postal es requerido'),
    casaOTorre: yup.string(),
    depto: yup.string()
  })
});

export const FormularioEnvio = ({ user, onCancel, onSubmit: externalOnSubmit, missingFields }) => { const { register, handleSubmit, formState: { errors }, } = useForm({
    resolver: yupResolver(envioSchema),
    defaultValues: {
      nombreCompleto: user?.nombreCompleto || '',
      dniOCuit: user?.dniOCuit || '',
      telefono: user?.telefono || '',
      direccion: user?.direccion || {
        pais: '',
        provincia: '',
        ciudad: '',
        calle: '',
        numero: '',
        entreCalles: '',
        telefono: '',
        casaOTorre: '',
        depto: '',
        codigoPostal: ''
      }
    }
  });

  const onSubmit = (data) => {
    externalOnSubmit(data);
  };

  return (
    <div className="max-h-[70vh] overflow-y-auto p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {(missingFields.includes('nombreCompleto') || 
          missingFields.includes('dniOCuit') || 
          missingFields.includes('telefono')) && (
          <>
            <h3 className="text-lg font-medium mb-2">Datos personales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missingFields.includes('nombreCompleto') && (
                <div>
                  <label>Nombre completo *</label>
                  <Input {...register('nombreCompleto')} />
                  {errors.nombreCompleto && (
                    <p className="text-red-500 text-sm">{errors.nombreCompleto.message}</p>
                  )}
                </div>
              )}
              
              {missingFields.includes('dniOCuit') && (
                <div>
                  <label>DNI o CUIT *</label>
                  <Input {...register('dniOCuit')} />
                  {errors.dniOCuit && (
                    <p className="text-red-500 text-sm">{errors.dniOCuit.message}</p>
                  )}
                </div>
              )}
              
              {missingFields.includes('telefono') && (
                <div>
                  <label>Teléfono *</label>
                  <Input {...register('telefono')} />
                  {errors.telefono && (
                    <p className="text-red-500 text-sm">{errors.telefono.message}</p>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {(missingFields.includes('pais') || 
          missingFields.includes('provincia') || 
          missingFields.includes('ciudad') || 
          missingFields.includes('calle') || 
          missingFields.includes('numero') || 
          missingFields.includes('codigoPostal')) && (
          <>
            <h3 className="text-lg font-medium mb-2 mt-6">Dirección de envío</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missingFields.includes('pais') && (
                <div>
                  <label>País *</label>
                  <Input {...register('direccion.pais')} />
                  {errors.direccion?.pais && (
                    <p className="text-red-500 text-sm">{errors.direccion.pais.message}</p>
                  )}
                </div>
              )}
              
              {missingFields.includes('provincia') && (
                <div>
                  <label>Provincia *</label>
                  <Input {...register('direccion.provincia')} />
                  {errors.direccion?.provincia && (
                    <p className="text-red-500 text-sm">{errors.direccion.provincia.message}</p>
                  )}
                </div>
              )}
              
              {missingFields.includes('ciudad') && (
                <div>
                  <label>Ciudad *</label>
                  <Input {...register('direccion.ciudad')} />
                  {errors.direccion?.ciudad && (
                    <p className="text-red-500 text-sm">{errors.direccion.ciudad.message}</p>
                  )}
                </div>
              )}
              
              {missingFields.includes('calle') && (
                <div>
                  <label>Calle *</label>
                  <Input {...register('direccion.calle')} />
                  {errors.direccion?.calle && (
                    <p className="text-red-500 text-sm">{errors.direccion.calle.message}</p>
                  )}
                </div>
              )}
              
              {missingFields.includes('numero') && (
                <div>
                  <label>Número *</label>
                  <Input {...register('direccion.numero')} />
                  {errors.direccion?.numero && (
                    <p className="text-red-500 text-sm">{errors.direccion.numero.message}</p>
                  )}
                </div>
              )}
              {missingFields.includes('casaOTorre') && (
                <div>
                  <label>Casa O Torre</label>
                  <Input {...register('direccion.casaOTorre')} />
                  {errors.direccion?.casaOTorre && (
                    <p className="text-red-500 text-sm">{errors.direccion.casaOTorre.message}</p>
                  )}
                </div>
              )}
              {missingFields.includes('depto') && (
                <div>
                  <label>Depto</label>
                  <Input {...register('direccion.depto')} />
                  {errors.direccion?.depto && (
                    <p className="text-red-500 text-sm">{errors.direccion.depto.message}</p>
                  )}
                </div>
              )}
              {missingFields.includes('codigoPostal') && (
                <div>
                  <label>Código Postal *</label>
                  <Input {...register('direccion.codigoPostal')} />
                  {errors.direccion?.codigoPostal && (
                    <p className="text-red-500 text-sm">{errors.direccion.codigoPostal.message}</p>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Guardar y continuar
          </button>
        </div>
      </form>
    </div>
  );
};