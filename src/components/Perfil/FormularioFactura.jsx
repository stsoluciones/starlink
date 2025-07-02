'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

const schemaFactura = yup.object().shape({
  tipo: yup.string().required(),
  razonSocial: yup.string().required('La razón social es obligatoria'),
  cuit: yup.string()
    .matches(/^\d{7,11}$/, `Debe tener entre 7 y 11 dígitos numéricos`)
    .required('El CUIT es obligatorio'),
  domicilio: yup.string().required('El domicilio es obligatorio'),
  codigoPostal: yup.string()
    .matches(/^\d{4,5}$/, 'Código postal inválido')
    .required('El código postal es obligatorio'),
  condicionIva: yup.string().required('Selecciona una condición frente al IVA'),
})

export default function FormularioFactura({ tipo, onSubmit, onCancel, usuarioUid, initialData, esConsumidorFinal=true }) {
  const {
    register,
    reset,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm({
    resolver: yupResolver(schemaFactura),
    defaultValues: {
      tipo: tipo || 'B',
      razonSocial: '',
      cuit: '',
      domicilio: '',
      codigoPostal: '',
      condicionIva: '',
    },
    mode: 'onChange' // Validar en cada cambio
  })

  const condicionIva = watch('condicionIva')
  const tipoFactura = condicionIva === 'responsableInscripto' ? 'A' : 'B'

  useEffect(() => {
    if (initialData) {
      reset({
        tipo: tipo || 'B',
        razonSocial: initialData.razonSocial || '',
        cuit: initialData.cuit || '',
        domicilio: initialData.domicilio || '',
        codigoPostal: initialData.codigoPostal || '',
        condicionIva: initialData.condicionIva || '',
      })
    } else if (usuarioUid) {
      const fetchData = async () => {
        try {
          const response = await fetch(`/api/usuarios/${usuarioUid}`)
          const userData = await response.json()
          
          reset({
            tipo: tipo || 'B',
            razonSocial: userData.factura?.razonSocial || '',
            cuit: userData.factura?.cuit || userData.dniOCuit || '',
            domicilio: userData.factura?.domicilio || 
              (userData.direccion ? 
                `${userData.direccion.calle || ''} ${userData.direccion.numero || ''}, ${userData.direccion.ciudad || ''}`.trim() : ''),
            codigoPostal: userData.factura?.codigoPostal || userData.direccion?.codigoPostal || '',
            condicionIva: userData.factura?.condicionIva || 'consumidorFinal'
          })
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      }
      fetchData()
    }
  }, [initialData, reset, tipo, usuarioUid])

  const enviar = (datos) => {
    if (!isValid) {
      console.error('El formulario no es válido')
      return
    }

    const datosEnviar = {
      ...datos,
      tipo: tipoFactura, // Usamos el tipo calculado
      cuit: datos.cuit.trim(),
    }

    console.log('Datos a enviar:', datosEnviar) // Para depuración
    onSubmit(datosEnviar)
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Datos del Cliente</h2>
      <form className="space-y-4" onSubmit={handleSubmit(enviar)}>
        <div>
          <label className="block text-sm">{esConsumidorFinal?'Nombre y Apellido':'Razón Social'}</label>
          <input placeholder="Ej: Mi empresa S.A." {...register('razonSocial')} className="w-full border rounded p-2" />
          {errors.razonSocial && <p className="text-red-500 text-sm">{errors.razonSocial.message}</p>}
        </div>

        <div>
          <label className="block text-sm">{esConsumidorFinal?'DNI':'CUIT'}</label>
          <input placeholder="Ej: 20304050607" {...register('cuit')} className="w-full border rounded p-2" />
          {errors.cuit && <p className="text-red-500 text-sm">{errors.cuit.message}</p>}
        </div>

        <div>
          <label className="block text-sm">Domicilio Fiscal</label>
          <input placeholder="Ej: Av. Siempreviva 742" {...register('domicilio')} className="w-full border rounded p-2" />
          {errors.domicilio && <p className="text-red-500 text-sm">{errors.domicilio.message}</p>}
        </div>

        <div>
          <label className="block text-sm">Código Postal</label>
          <input placeholder="Ej: 1407" {...register('codigoPostal')} className="w-full border rounded p-2" />
          {errors.codigoPostal && <p className="text-red-500 text-sm">{errors.codigoPostal.message}</p>}
        </div>

        <div>
          <label className="block text-sm">Condición frente al IVA</label>
          <select {...register('condicionIva')} className="w-full border rounded p-2">
            <option value="">Seleccionar</option>
            <option value="consumidorFinal">Consumidor Final</option>
            <option value="responsableInscripto">Responsable Inscripto</option>
            <option value="monotributista">Monotributista</option>
            <option value="exento">Exento</option>
          </select>
          {errors.condicionIva && <p className="text-red-500 text-sm">{errors.condicionIva.message}</p>}
        </div>
        <div>
            <label className="block text-sm">Tipo de Factura</label>
            <input value={tipoFactura} readOnly className="w-full border rounded p-2 bg-gray-100 text-gray-600" />
            <input type="hidden" value={tipoFactura} {...register('tipo')} />
        </div>
        {Object.keys(errors).length > 0 && (
          <p className="text-red-500 text-sm">Completa todos los campos correctamente.</p>
        )}
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
            className={`px-4 py-2 text-white rounded ${
              isValid ? 'bg-primary hover:bg-primary-hover' : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={!isValid}
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  )
}