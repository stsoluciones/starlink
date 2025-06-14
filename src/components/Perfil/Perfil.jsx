'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input } from '../ui/input';

// Esquema de validación
const profileSchema = yup.object().shape({
  nombreCompleto: yup.string().required('El nombre completo es requerido'),
  correo: yup.string().email('Correo electrónico inválido').required('El correo es requerido'),
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
    pais: yup.string(),
    provincia: yup.string(),
    ciudad: yup.string(),
    calle: yup.string(),
    numero: yup.string(),
    casaOTorre: yup.string(),
    depto: yup.string(),
    codigoPostal: yup.string()
  })
});

const PerfilPage = ({ usuarioUid }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      nombreCompleto: '',
      correo: '',
      dniOCuit: '',
      telefono: '',
      direccion: {
        pais: '',
        provincia: '',
        ciudad: '',
        calle: '',
        numero: '',
        casaOTorre: '',
        depto: '',
        codigoPostal: ''
      }
    }
  });

  useEffect(() => {
    if (!usuarioUid) {
      router.push('/user/Login');
    } else {
      fetchUserData();
    }
  }, [usuarioUid]);

const fetchUserData = async () => {
  try {
    const response = await fetch(`/api/usuarios/${usuarioUid}`, {
      method: 'GET',
      credentials: 'include', // Esto es crucial para enviar cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener datos del usuario');
    }
    
    const userData = await response.json();
    setUser(userData);
    reset({
      nombreCompleto: userData.nombreCompleto || '',
      correo: userData.correo || '',
      dniOCuit: userData.dniOCuit || '',
      telefono: userData.telefono || '',
      direccion: userData.direccion || {
        pais: '',
        provincia: '',
        ciudad: '',
        calle: '',
        numero: '',
        casaOTorre: '',
        depto: '',
        codigoPostal: ''
      }
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    toast.error(error.message || 'Error al cargar los datos del perfil');
  } finally {
    setIsLoading(false);
  }
};
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/usuarios/${usuarioUid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Error al actualizar los datos');
      const updatedUser = await response.json();
      setUser(updatedUser);
      reset(updatedUser);
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="mt-2 text-sm text-gray-600"> Actualiza tu información personal y de contacto </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex flex-col sm:col-span-1">
              <label htmlFor="nombreCompleto">Nombre completo <span className='text-xs text-red-500'>*</span></label>
              <Input {...register('nombreCompleto')} className="" />
              {errors.nombreCompleto && <p className="text-red-500 text-sm">{errors.nombreCompleto.message}</p>}
            </div>

            <div className="flex flex-col sm:col-span-1">
              <label htmlFor="correo">Correo electrónico <span className='text-xs text-red-500'>*</span></label>
              <Input {...register('correo')} disabled className="input bg-gray-100" />
              {errors.correo && <p className="text-red-500 text-sm">{errors.correo.message}</p>}
            </div>

            <div className="flex flex-col sm:col-span-1"> 
              <label htmlFor="telefono">Teléfono</label>
              <Input {...register('telefono')} className="input" />
              {errors.telefono && <p className="text-red-500 text-sm">{errors.telefono.message}</p>}
            </div>

            <div className="flex flex-col sm:col-span-1">
              <label htmlFor="dniOCuit">DNI o CUIT</label>
              <Input {...register('dniOCuit')} className="input" />
              {errors.dniOCuit && <p className="text-red-500 text-sm">{errors.dniOCuit.message}</p>}
            </div>

            <div className="sm:col-span-2 border-t pt-4 mt-4">
              <h3 className="text-lg font-medium text-gray-900">Dirección</h3>
            </div>

            <div>
              <label htmlFor="direccion.pais">País</label>
              <Input {...register('direccion.pais')} className="input" />
            </div>

            <div>
              <label htmlFor="direccion.provincia">Provincia</label>
              <Input {...register('direccion.provincia')} className="input" />
            </div>

            <div>
              <label htmlFor="direccion.ciudad">Ciudad</label>
              <Input {...register('direccion.ciudad')} className="input" />
            </div>

            <div>
              <label htmlFor="direccion.codigoPostal">Código Postal</label>
              <Input {...register('direccion.codigoPostal')} className="input" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="direccion.calle">Calle</label>
              <Input {...register('direccion.calle')} className="input" />
            </div>

            <div>
              <label htmlFor="direccion.numero">Número</label>
              <Input {...register('direccion.numero')} className="input" />
            </div>

            <div>
              <label htmlFor="direccion.casaOTorre">Casa o Torre</label>
              <Input {...register('direccion.casaOTorre')} className="input" />
            </div>

            <div>
              <label htmlFor="direccion.depto">Depto</label>
              <Input {...register('direccion.depto')} className="input" />
            </div>
          </div>

          <div className="text-center">
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Guardar cambios
            </button>
          </div>
        </form>
    </div>
  );
};

export default PerfilPage;
