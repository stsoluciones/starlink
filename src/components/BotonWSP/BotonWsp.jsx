/* eslint-disable react/prop-types */

import { FaWhatsapp } from "react-icons/fa";
import userData from "../../components/constants/userData";

// crear userData en /constants
// const userData = {
//   name:'Starcam',
//   contact:2235032141,
//   codigoPais:54,
//   textBoton:'¡Contáctame!',
//   email:'starcaminfo@gmail.com',
//   textoPredefinido:'Hola, me gustaria saber mas sobre, '
// };

// export default userData;

const BotonWsp = ({texto}) => {

  const enviar = `https://wa.me/+${userData.codigoPais}${userData.contact}?text=${encodeURIComponent(texto?texto:userData.textoPredefinido)}`;

  return (
    <article className="fixed bottom-6 right-6 z-40">
      <a href={enviar} title="Boton de contacto whatsaap">
        <button rel="noopener noreferrer" className='flex items-center justify-center bg-green-500 text-white font-bold p-4 rounded-full' aria-label="Contact via WhatsApp" role="button" data-client={true} >
          <FaWhatsapp className='text-white text-3xl'aria-label="Boton de contacto whatsaap"/>
        </button>
      </a>
    </article>
  );
}

export default BotonWsp;
