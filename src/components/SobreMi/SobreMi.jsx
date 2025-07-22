import Link from "next/link";
import {infoWeb} from "../../components/constants/infoWeb";
import userData from "../constants/userData";

const SobreMi = () => {

  return (
    <section id="nosotros" className="" style={{textAlign:"-webkit-center"}}>
      <article className="">
        <div className="py-8 px-8 mx-auto max-w-6xl  sm:py-16 lg:px-6">
          <div className="max-w-6xl">
            <h2 className="mb-8 text-3xl md:text-4xl text-center font-extrabold text-primary uppercase ">¿Quines Somos?</h2>
              <p className="text-gray-500 sm:text-lg md:text-xl font-light md:max-w-7xl w-full text-justify mb-8">En 
                <strong className="text-text-danger font-bold"> {userData.name}</strong>, nos dedicamos a la fabricación y comercialización de artículos tecnológicos diseñados para facilitar tu día a día.
              </p>
              <p className="text-gray-500 sm:text-lg md:text-xl font-light md:max-w-7xl w-full text-justify mb-8">
                Contamos con amplia experiencia en la producción de cables inyectados, fichas y adaptadores, desarrollados con altos estándares de calidad. Además, incorporamos constantemente productos innovadores y vanguardistas para ofrecerte soluciones prácticas y modernas.
              </p>
              <h1 className="text-gray-500 sm:text-lg md:text-xl font-light md:max-w-7xl w-full text-justify mb-8">
                Uno de nuestros productos más destacados es el <strong>adaptador Starlink Mini para vehículos</strong>
                , compatible con sistemas de 12 y 24 voltios, ideal para que puedas llevar tu conexión a donde vayas. Te invitamos a descubrir todo lo que tenemos para ofrecerte y ser parte de nuestras soluciones tecnológicas.
              </h1>
            {/* <div className="flex flex-col md:flex-row items-center justify-items-center justify-between mb-8">
              <Link href="/nosotros" title="Consulta">
                <p className="mt-4 md:mt-0 text-white font-medium rounded-lg text-sm px-3 py-2 uppercase text-center bg-boton-primary hover:bg-boton-primary-hover active:bg-boton-primary-active">
                  Ver más
                </p>
              </Link> 
            </div>*/}
          </div>
        <h2 className="text-gray-500 sm:text-lg md:text-xl font-light md:max-w-7xl w-full text-justify mb-8">
          Encuentra los mejores productos y servicios aquí: <strong>Elevadores de tension, alargues, baterias</strong> y muchos accesorios como la <strong>fuente adaptador de STARLINK mini.</strong> Además contamos con Servicio de asesoramiento y envios.
        </h2>
        </div>
      </article>
    </section>
  );
};

export default SobreMi;
