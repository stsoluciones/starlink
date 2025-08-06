import Link from "next/link";
import {infoWeb} from "../../components/constants/infoWeb";
import userData from "../constants/userData";

const SobreMi = () => {

  return (
    <section id="nosotros" className="" style={{textAlign:"-webkit-center"}}>
      <article className="px-4 md:pr-8 mx-auto max-w-7xl py-8 gap-2">
        <div className="">
          <div className="max-w-7xl">
            <h2 className="mb-4 text-2xl md:text-3xl lg:text-4xl text-center font-extrabold text-primary uppercase ">¿Quiénes Somos?</h2>
              <p className="text-gray-500 sm:text-lg md:text-xl font-light md:max-w-7xl w-full text-justify mb-8">En 
                <strong className="text-text-danger font-bold"> {userData.name}</strong>, nos dedicamos a la fabricación y comercialización de artículos tecnológicos diseñados para facilitar tu día a día.
              </p>
              <p className="text-gray-500 sm:text-lg md:text-xl font-light md:max-w-7xl w-full text-justify mb-8">
                Contamos con amplia experiencia en la producción de cables inyectados, fichas y adaptadores, desarrollados con altos estándares de calidad. Además, incorporamos constantemente productos innovadores y vanguardistas para ofrecerte soluciones prácticas y modernas.
              </p>
              <h1 className="text-gray-500 sm:text-lg md:text-xl font-light md:max-w-7xl w-full text-justify mb-8">
                Uno de nuestros productos más destacados es el <strong>adaptador Starlink Mini para vehículos</strong>
                , compatible con sistemas de 12 y 24 voltios, ideal para que puedas llevar tu conexión a donde vayas. Te invitamos a descubrir todo lo que tenemos para ofrecerte y a ser parte de nuestras soluciones tecnológicas.
              </h1>
            {/* <div className="flex flex-col md:flex-row items-center justify-items-center justify-between mb-8">
              <Link href="/nosotros" title="Consulta">
                <p className="mt-4 md:mt-0 text-white font-medium rounded-lg text-sm px-3 py-2 uppercase text-center bg-boton-primary hover:bg-boton-primary-hover active:bg-boton-primary-active">
                  Ver más
                </p>
              </Link> 
            </div>*/}
          </div>
        <h2 className="text-gray-500 sm:text-lg md:text-xl md:hidden font-light md:max-w-7xl w-full text-justify mb-8">
          Encuentra los mejores productos y servicios aquí: <strong>elevadores de tensión, alargues, baterías</strong> y muchos accesorios como la <strong>fuente adaptadora para Starlink Mini.</strong> Además, contamos con servicio de asesoramiento y envíos.
        </h2>
        </div>
      </article>
    </section>
  );
};

export default SobreMi;
