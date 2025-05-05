import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiShareFill } from "react-icons/ri";

const ProductoDetalle = ({ selectedProduct, mainImage, handleThumbnailClick, thumbnails, handleShare, handleAddToCart, enviar  }) => {
    const path = usePathname()
    return(
    <article className="py-0 bg-white md:py-4 antialiased">
        <div className="max-w-screen-xl px-2 mx-auto 2xl:px-0">
            <div className="lg:grid lg:grid-cols-2 lg:gap-6 xl:gap-12">
                {/* Sección de imágenes */}
                <div id="imagenes" className="shrink-0 max-w-md lg:max-w-lg mx-auto flex flex-col justify-center" >
                {selectedProduct.vendido && (
                <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-3xl font-bold shadow-lg bg-red-400 px-2 rounded-md">VENDIDO</p>
                )}
                <div className="flex justify-center relative">
                    {mainImage ? (
                    <Image
                        src={mainImage}
                        alt={`Imagen principal de ${selectedProduct.nombre}`}
                        title={`Imagen principal de ${selectedProduct.nombre}`}
                        width={220}
                        height={220}
                        className="rounded-lg md:w-96 md:h-96"
                        loading="lazy"
                    />
                    ) : (
                    <Image
                        src="/images/sinFoto.webp"
                        alt="Sin foto disponible"
                        title="Sin foto disponible"
                        width={220}
                        height={220}
                        className="rounded-lg md:w-96 md:h-96"
                        loading="lazy"
                    />
                    )}
                    <div className="absolute top-1 left-1 text-sm md:text-base bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold px-3 py-1 rounded-tr-lg rounded-bl-lg shadow-md shadow-orange-300 hover:scale-105 hover:cursor-pointer">
                    {Number(selectedProduct.precio).toLocaleString('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                    })}
                    </div>
                    <button onClick={handleShare} className="inline-flex items-center justify-center w-10 h-10 bg-orange-400 hover:bg-green-600 rounded-full text-white z-10" disabled={selectedProduct.vendido} >
                        <RiShareFill />
                    </button>
                </div>
                {/* Miniaturas: cada imagen se muestra dentro de un botón para mejorar la accesibilidad */}
                <div className="flex mt-2 justify-center">
                    {thumbnails.map((thumb, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => handleThumbnailClick(thumb.src)}
                        className="mr-2 border border-gray-200 rounded-lg p-0"
                        aria-label={`Mostrar imagen ${index + 1} de ${selectedProduct.nombre}`}
                        title={`Mostrar imagen ${index + 1} de ${selectedProduct.nombre}`}
                    >
                        <Image
                        src={thumb.src}
                        alt={thumb.alt}
                        title={thumb.alt}
                        width={64}
                        height={64}
                        className="rounded-lg"
                        loading="lazy"
                        />
                    </button>
                    ))}
                </div>
                
                </div>

                {/* Sección de detalles del producto */}
                <div className="flex flex-col mt-2 md:mt-6 lg:mt-0">
                    {path === '/productos/[nombre]'? 
                <h2 id="modal-title" className="text-xl font-semibold text-gray-600 sm:text-2xl">{selectedProduct.titulo_de_producto?.toUpperCase()}</h2>
                :
                <h1 id="modal-title" className="text-xl font-semibold text-gray-600 sm:text-2xl">{selectedProduct.titulo_de_producto?.toUpperCase()}</h1>}
                <hr className="my-6 md:my-8 border-gray-200" />
                <p className="mb-1 md:mb-4 text-gray-500 text-start">
                    <strong>Nombre: </strong>
                    {selectedProduct.nombre}
                </p>
                <p className="mb-1 md:mb-4 text-gray-500 text-start">
                    <strong>Marca: </strong>
                    {selectedProduct.marca}
                </p>
                <p className="mb-1 md:mb-4 text-gray-500 text-start">
                    <strong>Modelo: </strong>
                    {selectedProduct.modelo}
                </p>
                <p className="mb-1 md:mb-4 text-gray-500 text-start">
                    <strong>N° de Serie: </strong>
                    {selectedProduct.n_serie}
                </p>
                <p className="mb-1 md:mb-4 text-gray-500 text-start">
                    <strong>Código: </strong>
                    {selectedProduct.cod_producto}
                </p>
                <p className="mb-1 md:mb-4 text-gray-500 text-start whitespace-pre-line">
                    <strong>Descripción: </strong>
                    {selectedProduct.descripcion}
                </p>

                <div className="mt-1 md:mt-4 gap-2 items-center flex flex-col md:flex-row justify-center md:items-start">
                    {/* Enlace a MercadoShop (si la URL está definida) */}
                    {/* {selectedProduct.n_electronica && (
                    <Link
                        href={selectedProduct.n_electronica}
                        title="Ver en MercadoShop"
                        aria-label="Ver producto en MercadoShop"
                        className="w-full text-gray-500 mt-2 md:mt-4 py-2 hover:bg-boton-primary-hover font-medium rounded-lg text-sm px-4 flex items-center justify-center"
                        target="_blank"
                    >
                        {selectedProduct.vendido?'':<>
                        <MdStore size={16} aria-label="boton para compartir" />
                        <span className="ms-1">MercadoShop</span>
                        </>
                    }
                    </Link>
                    )} */}

                    {/* Botón para agregar al carrito */}
                    {selectedProduct.vendido?'':
                    <button
                        onClick={handleAddToCart}
                        type="button"
                        title="Agregar al carrito"
                        aria-label="Agregar producto al carrito"
                        className="text-gray-500 mt-2 md:mt-4 py-2 hover:bg-boton-secondary-hover font-medium rounded-lg text-sm px-4 flex items-center justify-center"
                    >
                        <svg
                        className="w-5 h-5 -ms-2 me-2"
                        aria-label="agregar al carrito"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                        >
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 4h1.5L8 16m0 0h8m-8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm.75-3H7.5M11 7H6.312M17 4v6m-3-3h6"
                        />
                        </svg>
                        <span>AGREGAR</span>
                    </button>
                    }
                    {selectedProduct.vendido?'':
                    <div className='flex items-center justify-items-center'>
                        {/* Enlace para consultar vía WhatsApp */}
                        <Link
                        href={enviar}
                        title="Consultar producto por WhatsApp"
                        aria-label="Consultar producto por WhatsApp"
                        className="text-gray-500 mt-2 md:mt-4 py-2 hover:bg-boton-secondary-hover active:bg-boton-secondary-active font-medium rounded-lg text-sm px-4 flex items-center justify-center"
                        target="_blank"
                        >
                        <span>CONSULTAR</span>
                        </Link>
                        {/* <button className="text-gray-500 mt-2 md:mt-4 py-2 hover:bg-boton-secondary-hover active:bg-boton-secondary-active font-medium rounded-lg px-4 flex items-center justify-center text-base" onClick={handleShare}>
                            <IoShareSocialSharp />
                            </button> */}
                    </div>
                    }
                </div>
                </div>
            </div>
        </div>
 
    </article>
    )
};

export default ProductoDetalle