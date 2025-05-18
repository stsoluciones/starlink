'use client';
import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { setInLocalStorage } from '../../Hooks/localStorage';
import ProtectedRoute from '../ProtectedRoute/ProtectedRoute'
import { signUp, signInWithGoogle } from '../../lib/firebase';

const handleAuthError = dynamic(() => import('../../Utils/handleErrorsFirebase'));
const Loading = dynamic(() => import('../Loading/Loading'));

const Register = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    const createUserInMongoDB = async (user, additionalData = {}) => {
        const idToken = await user.getIdToken();
        const response = await fetch('/api/usuarios', {
            method: 'POST', // Initially try POST for new users
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`, // Send Firebase ID token
            },
            body: JSON.stringify({
                uid: user.uid,
                correo: user.email,
                nombreCompleto: additionalData.nombreCompleto || user.displayName || '',
                dniOCuit: additionalData.dniOCuit || '',
                telefono: additionalData.telefono || user.phoneNumber || '',
                direccion: additionalData.direccion || {},
            }),
        });

        if (response.ok) {
            const data = await response.json();
            return data.token;
        } else {
            const errorData = await response.json();
            console.error("Error creating/updating user in MongoDB:", errorData);
            throw new Error(errorData.error || 'Failed to create/update user data.');
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const res = await signUp(data);
            const { user } = res;
            console.log('user', user);
            
            await createUserInMongoDB(user, data);
            setInLocalStorage('USER', user);
            router.push('/');
        } catch (error) {
            handleAuthError(error.code);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setLoading(true);
        try {
            const res = await signInWithGoogle();
            const { user } = res;
            const token = await createUserInMongoDB(user);
            setInLocalStorage('USER', user);
            router.push('/');
        } catch (error) {
            handleAuthError(error.code);
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

  return (
    <Suspense fallback={<Loading/>}>
      <ProtectedRoute>
        <section>
          <ToastContainer position="top-center" autoClose={3000} theme="colored" />
          <article className="bg-secondary-background h-[100vh]">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
              <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <Link href="/" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 justify-center" title="SLS Logo">
                        <Image className="mr-2 h-auto" src="/logos/logoSLS.webp" width={100} height={100} alt="SLS logo" title="SLS Logo" loading="lazy" />
                        <p className='uppercase text-4xl text-transparent font-bold bg-clip-text bg-primary tracking-tight leading-none scale-x-90 '>SLS</p>
                    </Link>
                    <form id='formRegister' className="space-y-4 md:space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                      <label htmlFor="emailLogin" className="block mb-2 text-sm font-medium text-gray-900">Email</label>
                      <input 
                        type="email" 
                        id="emailRegister" 
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-3 focus:ring-primary focus:border-primary block w-full p-2.5 placeholder-gray-400"
                        placeholder="nombre@empresa.com" 
                        {...register('email', { required: true })} 
                      />
                      {errors.email && <p className="text-sm text-red-600">Este campo es requerido</p>}
                    </div>
                        <div>
                            <label htmlFor="passwordRegister" className="block mb-2 text-sm font-medium text-gray-900">password</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    id="passwordRegister" 
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-3 focus:ring-primary focus:border-primary block w-full p-2.5 placeholder-gray-400"
                                    placeholder="••••••••" 
                                    {...register('password', { required: true })} 
                                />
                                <button 
                                    type="button" 
                                    onClick={togglePasswordVisibility} 
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5" 
                                    aria-label="ver password"
                                    >
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                </button>
                            </div>
                            {errors.password && <p className="text-sm text-red-600">Este campo es requerido</p>}
                        </div>
                        <div>
                            <label htmlFor="confirm-passwordRegister" className="block mb-2 text-sm font-medium text-gray-900">Confirmar password</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    id="confirm-passwordRegister" 
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-3 focus:ring-primary focus:border-primary block w-full p-2.5 placeholder-gray-400"
                                    placeholder="••••••••" 
                                    {...register('confirmpassword', { required: true })} 
                                />
                                <button 
                                    type="button" 
                                    onClick={togglePasswordVisibility} 
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5" 
                                    aria-label="ver password"
                                    >
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                </button>
                            </div>
                            {errors.confirmpassword && <p className="text-sm text-red-600">Este campo es requerido</p>}
                        </div>
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input id="termsRegister" aria-describedby="terms" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300" required=""/>
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="termsRegister" className="font-light text-gray-500">Acepto los <Link className="font-medium text-primary-600 hover:underline" href="#">Términos y Condiciones</Link></label>
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            className="uppercase flex justify-center w-full text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-2" 
                            disabled={loading} 
                            aria-label="iniciar sesion"
                            >
                            {loading ? <Loading /> : 'Crear cuenta'}
                            </button>
                            <button 
                                type="button"
                                onClick={handleGoogleSignUp}
                                className="mt-2 w-full flex justify-center items-center gap-2 text-white bg-red-500 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                aria-label="crear cuenta con Google"
                                disabled={loading}
                                >
                                <FontAwesomeIcon icon={faGoogle} className="text-white" />
                                {loading ? <Loading /> : 'Crear cuenta con Google'}
                              </button>

                        <p className="text-sm font-light text-gray-500">
                            ¿Ya tienes una cuenta? <Link href="/user/Login" className="font-medium text-primary-600 hover:underline">Inicia sesión aquí</Link>
                        </p>
                    </form>
                </div>
              </div>
            </div>
          </article>
        </section>
      </ProtectedRoute>
    </Suspense>
  );
};
export default Register;
