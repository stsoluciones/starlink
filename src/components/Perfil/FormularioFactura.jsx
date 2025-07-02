'use client'

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

export default function FormularioFactura({ tipo = 'B', onSubmit, onCancel, usuarioUid, initialData }) {
const {
  register,
  handleSubmit,
  reset,
  watch,
  formState: { errors }
} = useForm({
  resolver: yupResolver(schemaFactura),
  defaultValues: {
    tipo: '',
    razonSocial: '',
    cuit: '',
    domicilio: '',
    codigoPostal: '',
    condicionIva: '',
  }
})

    // Ver el valor actual de condicionIva
  const condicionIva = watch('condicionIva')

  // Determinar tipo según condición de IVA
  const tipoFactura = condicionIva === 'responsableInscripto' ? 'A' : 'B'

  useEffect(() => {
    // Don't make the API call here if initialData is provided as prop
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
      // Only fetch if no initialData provided
      const fetchData = async () => {
        try {
          const response = await fetch(`/api/usuarios/${usuarioUid}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const userData = await response.json();
          
          reset({
            tipo: tipo || 'B',
            razonSocial: userData.factura?.razonSocial || '',
            cuit: userData.factura?.cuit || userData.dniOCuit || '',
            domicilio: userData.factura?.domicilio || 
              (userData.direccion ? 
                `${userData.direccion.calle || ''} ${userData.direccion.numero || ''}, ${userData.direccion.ciudad || ''}`.trim() : ''),
            codigoPostal: userData.factura?.codigoPostal || userData.direccion?.codigoPostal || '',
            condicionIva: userData.factura?.condicionIva || 'consumidorFinal'
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      
      fetchData();
    }
  }, [initialData, reset, tipo, usuarioUid])

  const enviar = (datos) => {
    const tipoFactura = datos.condicionIva === 'responsableInscripto' ? 'A' : 'C'
    onSubmit({ ...datos, tipo: tipoFactura })
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Datos del Cliente </h2>
      <form className="space-y-4">
        <div>
          <label className="block text-sm">Razón Social</label>
          <input placeholder="Ej: Mi empresa S.A." {...register('razonSocial')} className="w-full border rounded p-2" />
          {errors.razonSocial && <p className="text-red-500 text-sm">{errors.razonSocial.message}</p>}
        </div>

        <div>
          <label className="block text-sm">CUIT</label>
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
            <option value="responsableInscripto">Responsable Inscripto</option>
            <option value="monotributista">Monotributista</option>
            <option value="exento">Exento</option>
            <option value="consumidorFinal">Consumidor Final</option>
          </select>
          {errors.condicionIva && <p className="text-red-500 text-sm">{errors.condicionIva.message}</p>}
        </div>
        <div>
            <label className="block text-sm">Tipo de Factura</label>
            <input value={tipoFactura} readOnly className="w-full border rounded p-2 bg-gray-100 text-gray-600" />
        </div>

        <div className="flex justify-between mt-4">
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
            Cancelar
          </button>
          <button type="submit" onClick={enviar} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover" >
            Guardar
          </button>
        </div>
      </form>
    </div>
  )
}