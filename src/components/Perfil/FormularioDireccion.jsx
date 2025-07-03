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
  depto: yup.string().notRequired(),
  codigoPostal: yup.string()
    .matches(/^\d{4,5}$/, 'Código postal inválido')
    .required('El código postal es obligatorio'),
});

export default function FormularioDireccion({ onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
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
    }
  });

  return (
    <div className="p-6 bg-white rounded-xl max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 uppercase">Dirección de Envío</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 uppercase">

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm">País</label>
            <input {...register('pais')} className="w-full border rounded p-2" />
            {errors.pais && <p className="text-red-500 text-sm">{errors.pais.message}</p>}
          </div>
          <div>
            <label className="block text-sm">Provincia</label>
            <input {...register('provincia')} className="w-full border rounded p-2" />
            {errors.provincia && <p className="text-red-500 text-sm">{errors.provincia.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm">Localidad</label>
            <input {...register('ciudad')} className="w-full border rounded p-2" />
            {errors.ciudad && <p className="text-red-500 text-sm">{errors.ciudad.message}</p>}
          </div>
          <div>
            <label className="block text-sm">Calle</label>
            <input {...register('calle')} className="w-full border rounded p-2" />
            {errors.calle && <p className="text-red-500 text-sm">{errors.calle.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm">Número</label>
            <input {...register('numero')} className="w-full border rounded p-2" />
            {errors.numero && <p className="text-red-500 text-sm">{errors.numero.message}</p>}
          </div>
          <div>
            <label className="block text-sm">Casa / Torre</label>
            <input {...register('casaOTorre')} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm">Piso</label>
            <input {...register('piso')} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm">Depto</label>
            <input {...register('depto')} className="w-full border rounded p-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">

          <div>
            <label className="block text-sm">telefono</label>
            <input {...register('telefono')} className="w-full border rounded p-2" />
            {errors.telefono && <p className="text-red-500 text-sm">{errors.telefono.message}</p>}
          </div>
          <div>
            <label className="block text-sm">Cód. Postal</label>
            <input {...register('codigoPostal')} className="w-full border rounded p-2" />
            {errors.codigoPostal && <p className="text-red-500 text-sm">{errors.codigoPostal.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <div>
            <label className="block text-sm">Entre Calles</label>
            <input {...register('entreCalles')} className="w-full border rounded p-2" />
            {errors.entreCalles && <p className="text-red-500 text-sm">{errors.entreCalles.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2">
            <label className="block text-sm">Otra informacion importante para el envio</label>
            <input {...register('referencia')} className="w-full border rounded p-2" />
            {errors.referencia && <p className="text-red-500 text-sm">{errors.referencia.message}</p>}
        </div>

        <div className="flex justify-between mt-4 text-base">
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-red-500 rounded hover:bg-red-500 text-white">
            Cancelar
          </button>
          <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover">
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
