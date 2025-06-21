'use client'
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import userData from "../../constants/userData";



export default function StarLinkAdapterInfo() {
  return (
    <section className="max-w-4xl mx-auto p-6 bg-white rounded-lg">
      <h1 className="text-2xl md:text-3xl lg:text-4xl text-transparent font-bold mb-4 bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary"> Fuente Adaptador para Antena Starlink Mini | Trifix SL1230 </h1>

      <div className="mb-6">
        <Image
          src="https://res.cloudinary.com/dnbrxpca3/image/upload/v1739680021/banner_tyckv1.webp"
          alt="Cable Adaptador Starlink Mini Trifix SL1230"
          width={800}
          height={450}
          className="rounded-lg aspect-[5/1]"
          title="Imagen del Cable Adaptador para Antena Starlink Mini"
          aria-label="Imagen del Cable Adaptador para Antena Starlink Mini Trifix SL1230"
          placeholder="blur"
          blurDataURL="/icons/icon-512x512.png"
        />
      </div>

      <motion.h2 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-lg md:text-2xl font-bold md:text-center text-gray-700 mb-6 text-justify tracking-tight">
        Fuente adaptadora con cable para antena Starlink Mini, diseñada especialmente para optimizar el rendimiento de tu conexión a internet en la ruta, asegurando máxima eficiencia y seguridad en todo momento.
      </motion.h2>
      <div className="bg-slate-300 p-1 mb-4" />
      <h3 className="text-xl text-gray-900 mb-4 text-center ">¿Cuántas veces te quedaste sin señal y pensaste que la culpa era del satélite?</h3>
      <p className="text-lg text-gray-700 mb-4 text-justify">
        Te contamos que el funcionamiento de la antena también depende del voltaje que recibe de tu vehículo o batería. Si este no es capaz de suministrar la tensión necesaria, la antena pierde estabilidad y eficiencia. Por eso, Trifix desarrolló la fuente adaptadora con cable para la antena Starlink Mini, dando inicio a su primer modelo: Trifix SL1230. Este dispositivo está diseñado para proporcionar el voltaje adecuado, asegurando una conexión a internet estable, eficiente y segura en todo momento.
      </p>
      <p className="text-lg text-gray-700 mb-4 text-justify">
        La fuente está compuesta por tres módulos: el primero es el conector que se conecta al vehículo; el segundo, la fuente elevadora de tensión, correctamente protegida, aislada y ventilada para un óptimo desempeño; y, por último, la ficha que llega hasta la antena, en total son 4mts de cable que te aseguran la conexion.
      </p>



      <motion.h2 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-2xl font-bold text-center text-gray-700 mb-6">Características destacadas</motion.h2>
      <ul className="list-none space-y-2 mb-6">
        <li className="flex items-center">
          <svg className="w-3.5 h-3.5 mr-2 text-primary-whats flex-shrink-0" aria-label="tilde ok" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
          </svg>
          <p>
            Entrada 12V - Salida 35V 5A – Convierte la energía de tu vehículo en un suministro estable y confiable para la necesidad de la Antena Starlink Mini
          </p>
        </li>
        <li className="flex items-center">
          <svg className="w-3.5 h-3.5 mr-2 text-primary-whats flex-shrink-0" aria-label="tilde ok" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
          </svg>
          <p>
            Protección avanzada contra sobrecargas y cortocircuitos.
          </p>
        </li>
        <li className="flex items-center">
          <svg className="w-3.5 h-3.5 mr-2 text-primary-whats flex-shrink-0" aria-label="tilde ok" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
          </svg>
          <p>
            Tensión estabilizada para un mejor rendimiento.
          </p>
        </li>
        <li className="flex items-center">
          <svg className="w-3.5 h-3.5 mr-2 text-primary-whats flex-shrink-0" aria-label="tilde ok" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
          </svg>
          <p>
            Uso continuo y confiable, ideal para viajes largos o en instalaciones fijas, con un diseño de flujo de aire ideal para refrigerar el dispositivo.
          </p>
        </li>
      </ul>

      <div
        className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6"
        role="alert"
        aria-label="Información de garantía y experiencia"
      >
        <p className="font-bold">Trifix tiene más de 15 años de experiencia en el rubro </p>
        <p>Cada adaptador es testeado y probado antes del despacho.</p>
      </div>

      <motion.h2 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-2xl font-bold text-center text-gray-700 mb-6">Especificaciones del producto</motion.h2>
      <table className="w-full mb-6 text-justify">
        <tbody>
          <tr className="border-b">
            <td className="flex items-center font-semibold py-2">
              <svg className="w-3.5 h-3.5 mr-2 text-primary-whats flex-shrink-0" aria-label="tilde ok" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
              Marca
            </td>
            <td>Trifix</td>
          </tr>
          <tr className="border-b">
            <td className="flex items-center font-semibold py-2">
              <svg className="w-3.5 h-3.5 mr-2 text-primary-whats flex-shrink-0" aria-label="tilde ok" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
              Modelo
            </td>
            <td>SL1230</td>
          </tr>
          <tr className="border-b">
            <td className="flex items-center font-semibold py-2">
              <svg className="w-3.5 h-3.5 mr-2 text-primary-whats flex-shrink-0" aria-label="tilde ok" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
              Tipo
            </td>
            <td>Alimentación - 12v a 35v</td>
          </tr>
          <tr className="border-b">
            <td className="flex items-center font-semibold py-2">
              <svg className="w-3.5 h-3.5 mr-2 text-primary-whats flex-shrink-0" aria-label="tilde ok" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
              Color
            </td>
            <td>Negro</td>
          </tr>
          <tr className="border-b">
            <td className="flex items-center font-semibold py-2">
              <svg className="w-3.5 h-3.5 mr-2 text-primary-whats flex-shrink-0" aria-label="tilde ok" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
              Largo
            </td>
            <td>4 m</td>
          </tr>
          <tr className="border-b">
            <td className="flex items-center font-semibold py-2">
              <svg className="w-3.5 h-3.5 mr-2 text-primary-whats flex-shrink-0" aria-label="tilde ok" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
              Material conductor
            </td>
            <td>Cobre 100%</td>
          </tr>
          <tr className="border-b">
            <td className="flex items-center font-semibold py-2">
              <svg className="w-3.5 h-3.5 mr-2 text-primary-whats flex-shrink-0" aria-label="tilde ok" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
              Conector
            </td>
            <td>Plug And Play</td>
          </tr>
          <tr className="border-b">
            <td className="flex items-center font-semibold py-2">
              <svg className="w-3.5 h-3.5 mr-2 text-primary-whats flex-shrink-0" aria-label="tilde ok" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
              Ambiente
            </td>
            <td>Interior/Exterior</td>
          </tr>
          <tr>
            <td className="flex items-center font-semibold py-2">
              <svg className="w-3.5 h-3.5 mr-2 text-primary-whats flex-shrink-0" aria-label="tilde ok" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
              Incluye conectores
            </td>
            <td>Sí</td>
          </tr>
          <tr>
            <td className="flex items-center font-semibold py-2">
              <svg className="w-3.5 h-3.5 mr-2 text-primary-whats flex-shrink-0" aria-label="tilde ok" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
              Garantia?
            </td>
            <td>Sí, garantia de Satisfaccion</td>
          </tr>
        </tbody>
      </table>

      <div className="bg-gray-100 py-6 rounded-lg mb-6">
        <h3 className="text-xl font-semibold mb-2">¿Por qué elegir nuestra fuente adaptador con cable?</h3>
        <p className="text-gray-700">
          El Cable de Alimentación Starlink Mini con Elevador de 12/35 Volt de Trifix es la solución ideal para quienes buscan un rendimiento óptimo en su conexión. Perfecto para autos, camionetas, motorhomes, camiones, lanchas y más, garantiza una alimentación constante y confiable para tu dispositivo Starlink Mini, optimizando tu experiencia de conectividad.
        </p>
      </div>

      {/* Contenedor para reservar espacio mientras carga el video */}
      <div className="relative pb-[56.25%] mb-6 aspect-video">
        <video
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          src="https://res.cloudinary.com/dnbrxpca3/video/upload/v1739681097/AdaptadorStarlinkMiniEnUso_xi6emb.mp4"
          autoPlay
          muted
          loop
          playsInline
          title="Adaptador Starlink Mini en uso"
          aria-label="Adaptador Starlink Mini en uso"
        >
          Tu navegador no soporta el elemento de video.
        </video>
      </div>

      <div className="text-center">
        <Link
          href={`https://api.whatsapp.com/send/?phone=%2B${userData.codigoPais}${userData.contact}&text=Hola%2C+me+gustaria+consultar+sobre%2C+el+adaptador+SL1230+&type=phone_number&app_absent=0`}
          className="inline-block bg-primary text-white font-bold py-2 px-4 rounded hover:bg-primary-hover transition duration-300"
          title="Consulta ahora y asegura tu conexión confiable"
          aria-label="Botón para consultar y asegurar la conexión confiable"
          target="_blank"
          referrerPolicy="no-referrer"
        >
          Consulta ahora y asegura tu conexión confiable
        </Link>
      </div>
    </section>
  );
}
