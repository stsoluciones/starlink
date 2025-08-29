import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schemaDireccion = yup.object().shape({
  pais: yup.string().required('El país es obligatorio'),
  provincia: yup.string().required('La provincia es obligatoria'),
  ciudad: yup.string().required('La ciudad es obligatoria'),
  calle: yup.string().required('La calle es obligatoria'),
  numero: yup.string().required('El número es obligatorio'),
  casaOTorre: yup.string().notRequired(),
  piso: yup.string().notRequired(),
  depto: yup.string().notRequired(),
  telefono: yup.string()
    .matches(/^\+?\d{7,15}$/, 'Teléfono inválido')
    .required('El teléfono es obligatorio'),
  codigoPostal: yup.string()
    .matches(/^\d{4,5}$/, 'Código postal inválido')
    .required('El código postal es obligatorio'),
  entreCalles: yup.string().notRequired(),
  referencia: yup.string().notRequired(),
});

export default function FormularioDireccion({ onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors, isValid } } = useForm({
    resolver: yupResolver(schemaDireccion),
    defaultValues: {
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

  // Campos obligatorios según el esquema
  const requiredFields = ['pais', 'provincia', 'ciudad', 'calle', 'numero', 'telefono', 'codigoPostal']

  return (
    <div className="p-6 bg-white rounded-xl max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 uppercase">Dirección de Envío</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 uppercase">

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
            <label className="block text-sm">{requiredFields.includes('telefono') && <span className="text-red-500 mr-1">*</span>}Teléfono</label>
            <input {...register('telefono')} className="w-full border rounded p-2" />
            {errors.telefono && <p className="text-red-500 text-sm">{errors.telefono.message}</p>}
          </div>
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
