import Image from 'next/image';
import Link from 'next/link';

const NotFoundPage = () => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold text-gray-800 mt-6 text-center">Página No Encontrada</h1> 
        <Image src="/404.webp" alt="404 Not Found" loading='lazy' title='Pagina no encontrada' width={600} height={600}/>
        <p className="text-gray-600 mt-2 text-center">Lo sentimos, pero la página que estás buscando no existe.</p>
        <Link href="/" className="mt-4 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition duration-300" title='Volver a inicio'>Volver al Inicio</Link>
      </div>
    </section>
  );
};

export default NotFoundPage;
