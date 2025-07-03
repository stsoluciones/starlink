'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

const schemaFactura = yup.object().shape({
  tipo: yup.string().required(),
  razonSocial: yup.string().required('La campo es obligatorio'),
  cuit: yup.string()
    .matches(/^\d{7,11}$/, `Debe tener entre 7 y 11 dígitos numéricos`)
    .required('El CUIT/DNI es obligatorio'),
  telefono: yup.string().required('El telefono es obligatorio'),
  email: yup.string()
    .required('El email es obligatorio'),
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
      telefono: '',
      email: '',
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
        telefono: initialData.telefono || '',
        email: initialData.email || '',
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
            telefono: userData.factura?.telefono || 
              (userData.direccion ? 
                `${userData.direccion.calle || ''} ${userData.direccion.numero || ''}, ${userData.direccion.ciudad || ''}`.trim() : ''),
            email: userData.factura?.email || userData.direccion?.email || '',
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

    //console.log('Datos a enviar:', datosEnviar) // Para depuración
    onSubmit(datosEnviar)
  }

  return (
    <div className="p-6 bg-white rounded-xl max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 uppercase">Datos del Cliente</h2>
      <form className="space-y-4" onSubmit={handleSubmit(enviar)}>
        <div>
          <label className="block text-sm uppercase">{esConsumidorFinal?'Nombre y Apellido':'Razón Social'}</label>
          <input placeholder="Ej: Mi empresa S.A." {...register('razonSocial')} className="w-full border rounded p-2" />
          {errors.razonSocial && <p className="text-red-500 text-sm">{errors.razonSocial.message}</p>}
        </div>

        <div>
          <label className="block text-sm uppercase">{esConsumidorFinal?'DNI':'CUIT'}</label>
          <input placeholder="Ej: 20304050607" {...register('cuit')} className="w-full border rounded p-2" />
          {errors.cuit && <p className="text-red-500 text-sm">{errors.cuit.message}</p>}
        </div>

        <div>
          <label className="block text-sm uppercase">Telefono</label>
          <input placeholder="Ej: 1136317444" {...register('telefono')} className="w-full border rounded p-2" />
          {errors.telefono && <p className="text-red-500 text-sm">{errors.telefono.message}</p>}
        </div>

        <div>
          <label className="block text-sm uppercase">email</label>
          <input placeholder="Ej: empresa@empresa.com" {...register('email')} className="w-full border rounded p-2" />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm uppercase">Condición frente al IVA</label>
          <select {...register('condicionIva')} className="w-full border rounded p-2">
            <option value="">Seleccionar</option>
            <option value="Consumidor Final">Consumidor Final</option>
            <option value="Responsable Inscripto">Responsable Inscripto</option>
            <option value="Monotributista">Monotributista</option>
            <option value="IVA Exento">IVA Exento</option>
          </select>
          {errors.condicionIva && <p className="text-red-500 text-sm">{errors.condicionIva.message}</p>}
        </div>

        {Object.keys(errors).length > 0 && (
          <p className="text-red-500 text-sm">Completa todos los campos correctamente.</p>
        )}
        <div className="flex justify-between mt-4">
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-red-500 rounded hover:bg-red-500r text-white">
            Cancelar
          </button>
          <button type="submit" className={`px-4 py-2 text-white rounded ${isValid ? 'bg-primary hover:bg-primary-hover' : 'bg-gray-400 cursor-not-allowed'}`}
            disabled={!isValid}>
            Guardar
          </button>
        </div>
      </form>
    </div>
  )
}