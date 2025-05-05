import Link from "next/link";
import {infoWeb} from "../../components/constants/infoWeb";

const SobreMi = () => {

  return (
    <section id="nosotros" className="shadow-xl shadow-blue-50" style={{textAlign:"-webkit-center"}}>
      <article className="bg-primary-background">
        <div className="py-8 px-8 mx-auto max-w-6xl  sm:py-16 lg:px-6">
          <div className="max-w-6xl">
            <h2 className="mb-8 text-3xl md:text-4xl text-center font-extrabold text-primary uppercase ">Nosotros</h2>
            <div className="flex flex-col md:flex-row items-center justify-items-center justify-between mb-8">
              <p className="text-gray-500 sm:text-lg md:text-xl font-light md:w-3/4 w-full text-justify">
                <strong className="text-text-danger font-bold">ESHOP DEVICES</strong>, es una Startup joven que nos dedicamos a la venta de insumos informaticos, trabajamos por whatsapp para entregas en persona y mercadoshops para quienes quieren envios.
              </p>
              <Link href="/nosotros" title="Consulta">
                <p className="mt-4 md:mt-0 text-white font-medium rounded-lg text-sm px-3 py-2 uppercase text-center bg-boton-primary hover:bg-boton-primary-hover active:bg-boton-primary-active">
                  Ver más
                </p>
              </Link>
            </div>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">¿Qué ofrecemos?</h2>
                <ul className="max-w-md space-y-1 text-gray-500 list-inside">
                  {infoWeb.ofrece.map((item, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="w-3.5 h-3.5 mr-2 text-primary-whats flex-shrink-0" aria-label="tilde ok" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
};

export default SobreMi;
