import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

const schemaFactura = yup.object().shape({
  tipo: yup.string().required(),
  razonSocial: yup.string().required('La razón social es obligatoria'),
  cuit: yup.string()
    .matches(/^\d{11}$/, 'El CUIT debe tener 11 dígitos')
    .required('El CUIT es obligatorio'),
  domicilio: yup.string().required('El domicilio es obligatorio'),
  codigoPostal: yup.string()
    .matches(/^\d{4,5}$/, 'Código postal inválido')
    .required('El código postal es obligatorio'),
  condicionIva: yup.string().required('Selecciona una condición frente al IVA'),
})

export default function FormularioFactura({ tipo = 'B', onSubmit, onCancel, initialData }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schemaFactura),
    defaultValues: {
      tipo,
      razonSocial: '',
      cuit: '',
      domicilio: '',
      codigoPostal: '',
      condicionIva: '',
    }
  })

  // Precargar datos si existen
  useEffect(() => {
    if (initialData) {
      reset({ ...initialData, tipo: initialData.tipo || tipo })
    }
  }, [initialData, tipo, reset])

  const enviar = (data) => {
    onSubmit(data)
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Datos para Factura {tipo}</h2>
      <form onSubmit={handleSubmit(enviar)} className="space-y-4">
        <div>
          <label className="block text-sm">Razón Social</label>
          <input {...register('razonSocial')} className="w-full border rounded p-2" />
          {errors.razonSocial && <p className="text-red-500 text-sm">{errors.razonSocial.message}</p>}
        </div>

        <div>
          <label className="block text-sm">CUIT</label>
          <input {...register('cuit')} className="w-full border rounded p-2" />
          {errors.cuit && <p className="text-red-500 text-sm">{errors.cuit.message}</p>}
        </div>

        <div>
          <label className="block text-sm">Domicilio Fiscal</label>
          <input {...register('domicilio')} className="w-full border rounded p-2" />
          {errors.domicilio && <p className="text-red-500 text-sm">{errors.domicilio.message}</p>}
        </div>

        <div>
          <label className="block text-sm">Código Postal</label>
          <input {...register('codigoPostal')} className="w-full border rounded p-2" />
          {errors.codigoPostal && <p className="text-red-500 text-sm">{errors.codigoPostal.message}</p>}
        </div>

        <div>
          <label className="block text-sm">Condición frente al IVA</label>
          <select {...register('condicionIva')} className="w-full border rounded p-2">
            <option value="">Seleccionar</option>
            <option value="responsableInscripto">Responsable Inscripto</option>
            <option value="monotributista">Monotributista</option>
            <option value="exento">Exento</option>
            <option value="consumidorFinal">Consumidor Final</option>
          </select>
          {errors.condicionIva && <p className="text-red-500 text-sm">{errors.condicionIva.message}</p>}
        </div>

        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  )
}
