'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MapIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import userData from '../constants/userData';

export default function Contact() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitSuccessful, isSubmitting } } = useForm({ mode: 'onTouched' });
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const onSubmit = async (data, e) => {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });      
      if (response.status === 200) {
        setIsSuccess(true);
        setMessage('Correo enviado exitosamente');
        reset();
      } else {
        setIsSuccess(false);
        setMessage('Error al enviar el correo');
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage('Client Error. Please check the console.log for more info');
      console.error(error);
    }
  };

  return (
    <section id="contacto" className='bg-primary-background'>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 text-center">
        <h2 className="mb-8 text-3xl md:text-4xl text-center font-extrabold text-primary uppercase ">Contacto</h2>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-8 pb-16 grid md:grid-cols-2 lg:grid-cols-2 gap-y-8 md:gap-x-8 md:gap-y-8 lg:gap-x-8 lg:gap-y-16">
        <article>
          {/* <h2 className="font-lato text-[#000000] "> {userData.botonNav} </h2> */}
          <p className="max-w-sm mt-4 mb-4 text-[#000000]">Completá el formulario, enviá un correo o escribime por WhatsApp, ¡lo que más te guste!</p>
          <div className="flex items-center mt-8 space-x-2 text-dark-600 text-[#000000]">
            <MapIcon className="w-4 h-4" />
            <span> {userData.direccion} </span>
          </div>

          <div className="flex items-center mt-2 space-x-2 text-dark-600  text-[#000000] ">
            <EnvelopeIcon className="w-4 h-4" />
            <a href={`mailto:${userData.email}`} title={userData.email}>{userData.email}</a>
          </div>

          <div className="flex items-center mt-2 space-x-2 text-dark-600 text-[#000000]">
            <PhoneIcon className="w-4 h-4" />
            <a href={`tel:+${userData.codigoPais}${userData.contact}`} title={userData.contact}>+{userData.codigoPais}{userData.contact}</a>
          </div>
        </article>
        <article>
          {!isSubmitSuccessful && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <input type="hidden" value='Consulta' {...register('subject')} />
              <input type="hidden" value="Enviado desde la WEB" {...register('from_name')} />
              <input type="checkbox" id="check" className="hidden" style={{ display: 'none' }} {...register('botcheck')} />

              <div className="mb-5">
                <label htmlFor="nameContact" className="sr-only">Nombre</label>
                <input id="nameContact" type="text" placeholder="Nombre" autoComplete="off" className={`w-full px-4 py-3 border-2 bg-primary-background placeholder:text-neutral-800 text-[#000000] rounded-md outline-none focus:ring-4 ${errors.name ? 'border-red-500 focus:border-red-500 ring-red-100  ' : 'border-neutral-300 ring-neutral-100 '}`}
                  {...register('name', { required: 'Ingresa tu nombre completo', maxLength: 80 })}
                />
                {errors.name && <div className="mt-1 text-text-danger"><small>{errors.name.message}</small></div>}
              </div>

              <div className="mb-5">
                <label htmlFor="email_addressContact" className="sr-only">Email</label>
                <input id="email_addressContact" type="email" placeholder="Email" autoComplete="off" className={`w-full px-4 py-3 border-2 bg-primary-background placeholder:text-neutral-800 text-[#000000] rounded-md outline-none  focus:ring-4 ${errors.email ? 'border-red-500 focus:border-red-500 ring-red-100  ' : 'border-neutral-300 focus:border-neutral-600 ring-neutral-100  '}`}
                  {...register('email', { required: 'Ingresa tu correo electrónico', pattern: { value: /^\S+@\S+$/i, message: 'Por favor, ingresa un correo electrónico válido' } })}
                />
                {errors.email && <div className="mt-1 text-text-danger"><small>{errors.email.message}</small></div>}
              </div>

              <div className="mb-3">
                <textarea name="message" placeholder="Mensaje..." className={`w-full px-4 py-3 border-2 bg-primary-background placeholder:text-neutral-800   text-[#000000]     rounded-md outline-none h-36 focus:ring-4 ${errors.message ? 'border-red-500 focus:border-red-500 ring-red-100  ' : 'border-neutral-300 focus:border-neutral-600 ring-neutral-100    '}`}
                  {...register('message', { required: 'Ingresa tu mensaje' })}
                />
                {errors.message && <div className="mt-1 text-text-danger"><small>{errors.message.message}</small></div>}
              </div>

              <button type="submit" className="w-full py-4 font-semibold text-white transition-colors rounded-md bg-primary hover:bg-boton-primary-hover active:bg-boton-primary-active px-7 " aria-label="enviar">
                {isSubmitting ? (
                  <svg className="w-5 h-5 mx-auto text-white   animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" ></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" ></path>
                  </svg>
                ) : (
                  'Enviar Mensaje'
                )}
              </button>
            </form>
          )}

          {isSubmitSuccessful && isSuccess && (
            <div className="flex flex-col items-center justify-center text-center text-white rounded-md">
              <svg width="100" height="100" className="text-green-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M26.6666 50L46.6666 66.6667L73.3333 33.3333M50 96.6667C43.8716 96.6667 37.8033 95.4596 32.1414 93.1144C26.4796 90.7692 21.3351 87.3317 17.0017 82.9983C12.6683 78.6649 9.23082 73.5204 6.8856 67.8586C4.54038 62.1967 3.33331 56.1283 3.33331 50C3.33331 43.8716 4.54038 37.8033 6.8856 32.1414C9.23082 26.4796 12.6683 21.3351 17.0017 17.0017C21.3351 12.6683 26.4796 9.23084 32.1414 6.88562C37.8033 4.5404 43.8716 3.33333 50 3.33333C62.3767 3.33333 74.2466 8.24998 82.9983 17.0017C91.75 25.7534 96.6666 37.6232 96.6666 50C96.6666 62.3768 91.75 74.2466 82.9983 82.9983C74.2466 91.75 62.3767 96.6667 50 96.6667Z"
                  stroke="currentColor" strokeWidth="3"
                />
              </svg>
              <h3 className="py-5 text-2xl font-medium text-green-500">EXITO</h3>
              <p className="text-neutral-900 md:px-4">{message}</p>
              <button className="mt-6 py-2 px-4 bg-red-500 rounded-full focus:outline-none text-neutral-100" onClick={() => reset()} aria-label="volver"> Volver</button>
            </div>
          )}

          {isSubmitSuccessful && !isSuccess && (
            <div className="flex flex-col items-center justify-center text-center text-neutral-900   rounded-md">
              <svg width="97" height="97" viewBox="0 0 97 97" className="text-red-500" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M27.9995 69C43.6205 53.379 52.3786 44.621 67.9995 29M26.8077 29L67.9995 69M48.2189 95C42.0906 95 36.0222 93.7929 30.3604 91.4477C24.6985 89.1025 19.554 85.6651 15.2206 81.3316C10.8872 76.9982 7.44975 71.8538 5.10454 66.1919C2.75932 60.53 1.55225 54.4617 1.55225 48.3333C1.55225 42.205 2.75932 36.1366 5.10454 30.4748C7.44975 24.8129 10.8872 19.6684 15.2206 15.335C19.554 11.0016 24.6985 7.56418 30.3604 5.21896C36.0222 2.87374 42.0906 1.66667 48.2189 1.66667C60.5957 1.66667 72.4655 6.58333 81.2172 15.335C89.9689 24.0867 94.8856 35.9566 94.8856 48.3333C94.8856 60.7101 89.9689 72.58 81.2172 81.3316C72.4655 90.0833 60.5957 95 48.2189 95Z"
                  stroke="CurrentColor"
                  strokeWidth="3"
                />
              </svg>
              <h3 className="py-5 text-2xl font-medium text-text-danger">Oops, Algo ocurrio!</h3>
              <p className="text-neutral-900 md:px-4">{message}</p>
              <button className="mt-6 py-2 px-4 bg-red-500 rounded-full focus:outline-none text-neutral-100" onClick={() => reset()} aria-label="intentar otra vez"> Volver a intentar </button>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
