import Link from "next/link";
import {infoWeb} from "../../components/constants/infoWeb";
import userData from "../constants/userData";

const SobreMi = () => {

  return (
    <section id="nosotros" className="shadow-xl shadow-blue-50" style={{textAlign:"-webkit-center"}}>
      <article className="bg-primary-background">
        <div className="py-8 px-8 mx-auto max-w-6xl  sm:py-16 lg:px-6">
          <div className="max-w-6xl">
            <h2 className="mb-8 text-3xl md:text-4xl text-center font-extrabold text-primary uppercase ">¿Quines Somos?</h2>
              <p className="text-gray-500 sm:text-lg md:text-xl font-light md:w-3/4 w-full text-justify mb-8">
                <strong className="text-text-danger font-bold">{userData.name}</strong>, somos una Startup joven que nos dedicamos a la venta de soluciones para productos StarLinkg, trabajamos con mercadolibre, andreani para quienes quieren envios y puede adquirir cualquiera de nuestros productos por la web.
              </p>
            {/* <div className="flex flex-col md:flex-row items-center justify-items-center justify-between mb-8">
              <Link href="/nosotros" title="Consulta">
                <p className="mt-4 md:mt-0 text-white font-medium rounded-lg text-sm px-3 py-2 uppercase text-center bg-boton-primary hover:bg-boton-primary-hover active:bg-boton-primary-active">
                  Ver más
                </p>
              </Link> 
            </div>*/}
          </div>
        <h1 className="text-lg text-gray-600 px-2 text-justify md:text-center">
          Encuentra los mejores productos y servicios aquí: <strong>Elevadores de tension, alargues, baterias</strong> y muchos accesorios como la <strong>fuente adaptador de STARLINK mini.</strong> Además contamos con Servicio de asesoramiento y envios.
        </h1>
        </div>
      </article>
    </section>
  );
};

export default SobreMi;
