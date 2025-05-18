'use client'
import { infoWeb, shippingOptions } from '../constants/infoWeb';
import PreguntasFrecuentes from '../PreguntasFrecuentas/PreguntasFrecuentas';

const NosotrosPage = () => {

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Sección: Acerca de Nosotros */}
      <section id="acerca-de-nosotros" aria-labelledby="acerca-nosotros-heading" className="mb-12" >
        <header className="text-center">
          <h1 id="acerca-nosotros-heading" className="mb-8 text-xl md:text-3xl xl:text-4xl text-center font-extrabold text-primary uppercase" title={infoWeb.title}>{infoWeb.title}</h1>
          <p className="text-sm mt-2" title={infoWeb.subtitle}>{infoWeb.subtitle}</p>
        </header>
        <article className="mt-6 text-justify">
          <div title="Sobre Eshop Devices" aria-label="Sobre Eshop Devices">
            <strong className="text-red-600 font-bold" title={infoWeb.title}>ESHOP DEVICES</strong>, es una Startup joven que nos dedicamos a la venta de insumos informáticos. Trabajamos por WhatsApp para entregas en persona y MercadoShops para quienes quieren envíos.
          </div>
        </article>
        <article id="forma-de-trabajar" className="mt-6 text-justify">
          <h2 className="text-2xl font-semibold mb-4" title="Forma de Trabajar" >Forma de Trabajar</h2>
          <p>
            En <strong className="text-red-600 font-bold">ESHOP DEVICES</strong> aceptamos productos electrónicos en consignación, tanto nuevos como usados,  para vender en nuestra web. Cada producto que recibimos es sometido a un riguroso proceso de chequeo para garantizar su funcionamiento y estado. Con base en esta evaluación, se determina una cotización justa que se publica en nuestra plataforma, permitiendo a nuestros clientes conocer y confiar en la calidad de los artículos ofrecidos.<br/>
            Actualmente aceptamos productos en Wilde, Don Bosco, Bernal y Quilmes.
          </p>
        </article>
      </section>

      {/* Sección: Qué Ofrecemos */}
      {/* <section id="que-ofrecemos" aria-labelledby="que-ofrecemos-heading" className="mb-12">
        <h2 id="que-ofrecemos-heading" className="mb-8 text-xl md:text-3xl xl:text-4xl text-center font-extrabold text-primary uppercase" title="Qué Ofrecemos">¿Qué productos ofrecemos?</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {productos
            .sort(() => Math.random() - 0.5) // Mezcla aleatoriamente los productos
            .slice(0, 6) // Toma los primeros 6 productos
            .map((prod, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200">
                <div className="flex flex-col items-center text-center">
                  {/* Si el producto cuenta con imagen se renderiza la etiqueta <Image> */}
                  {/* {prod.imagen && (
                    <Image
                      src={prod.imagen}
                      alt={`Imagen de ${prod.nombre}`}
                      title={`Imagen de ${prod.nombre}`}
                      aria-label={`Imagen de ${prod.nombre}`}
                      className="w-full h-auto mb-4 rounded"
                      width={200}
                      height={200}
                    />
                  )}
                  <h3 className="text-xl font-semibold text-gray-700 mb-2" title={prod.nombre}>{prod.nombre}</h3>
                  <p className="text-gray-600">
                    {prod.descripcion.length > 150
                      ? `${prod.descripcion.slice(0, 150)}...`
                      : prod.descripcion}
                  </p> */}
                  {/* Botón para ver detalles del producto  */}
                  {/* <button type="button"
                    alt={`Ver detalles de ${prod.nombre}`}
                    title={`Ver detalles de ${prod.nombre}`}
                    aria-label={`Ver detalles de ${prod.nombre}`}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-300"
                  >
                    Ver detalles
                  </button> 
                </div>
              </div>
            ))}
        </div> */}
      {/* </section>  */}

      {/* Sección: Opciones de Envío */}
      <section id="opciones-envio" aria-labelledby="envio-heading" className="mb-12">
        <h2 id="envio-heading" className="text-3xl font-semibold text-center" title="Opciones de Envío" >Opciones de Envío</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {shippingOptions.map((option) => (
            <div key={option.id} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200">
              <div className="flex flex-col items-center text-center">
                <h3 className="text-xl font-semibold text-gray-700 mb-2" title={option.name}>{option.name}</h3>
                <p className="text-gray-600 mb-2" title={option.description}>{option.description}</p>
                {option.cost && (
                  <p className="text-gray-800 font-medium text-lg" title={option.cost} >{option.cost}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sección: Preguntas Frecuentes */}
      <PreguntasFrecuentes />
    </main>
  );
};

export default NosotrosPage;
