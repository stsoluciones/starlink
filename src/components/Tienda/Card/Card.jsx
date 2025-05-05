'use client';

import React, { useContext } from 'react';
import { MdStore } from 'react-icons/md';
import { RiWhatsappLine, RiShareFill  } from 'react-icons/ri';
import IconShoopingCart from '../ShoopingCart/IconShoopingCart';
import userData from '../../../components/constants/userData';
import addToCart from '../../../Utils/addToCart';
import { CartContext } from '../../../components/Context/ShoopingCartContext';
import Link from 'next/link';
import Image from 'next/image';
import handleShare from '../../../Utils/handleShare';

const Card = ({ product, handleProductSelect }) => {
  const [cart, setCart] = useContext(CartContext);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, cart, setCart);
  };

  const handleConsult = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(enviar, '_blank');
  };

  const consultMessage = `Hola, quería consultar por ${product.nombre} (${product.cod_producto})`;
  const enviar = `https://wa.me/+${userData.codigoPais}${userData.contact}?text=${encodeURIComponent(
    consultMessage || userData.textoPredefinido
  )}`;
 
  

  return (
    <div className="relative sm:w-48 md:w-64 lg:w-56 xl:w-72 lg:h-80 xl:h-96 md:min-h-[320px] min-w-[150px] lg:min-h-[360px] xl:min-h-[420px] list-none cursor-pointer">
      <div
        className="relative flex flex-col justify-between w-full h-full bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition-shadow duration-300"
        onClick={() => handleProductSelect(product)}
        role="button"
        tabIndex="0"
        onKeyDown={(e) => e.key === 'Enter' && handleProductSelect(product)}
      >
        <div>
          <div className="relative aspect-square">
            {product.vendido && (
              <p className="absolute inset-0 flex items-center justify-center text-white text-3xl font-bold bg-red-400 bg-opacity-80 rounded-t-lg grayscale">
                VENDIDO
              </p>
            )}
            <button  onClick={handleAddToCart} className="absolute top-1 right-1 inline-flex items-center justify-center w-8 h-8 bg-boton-primary hover:bg-green-600 rounded-full text-white z-10" disabled={product.vendido} >
                <IconShoopingCart ancho={20} alto={20} color="#ffffff" />
            </button>
            <button onClick={(e)=>handleShare(e,product)} className="absolute top-10 right-1 inline-flex items-center justify-center w-8 h-8 bg-orange-400 hover:bg-boton-primary-hover rounded-full text-white z-10"
              disabled={product.vendido} >
                <RiShareFill />
            </button>

            <Image
              className="rounded-t-lg object-cover "
              src={product.foto_1_1 || '/images/sinFoto.webp'}
              alt={product.nombre}
              width={300}
              height={300}
              loading="lazy"
              title='Imagen del producto'
            />
            <Image
              className="absolute bottom-1 right-1 shadow-md rounded z-10"
              src={product.usado ? '/images/USADO.webp' : '/images/NUEVO.webp'}
              alt={product.usado ? 'producto usado' : 'producto nuevo'}
              width={product.usado ? 112 : 64}
              height={32}
              loading="lazy"
              title='Estado del producto'
            />
            <div className="absolute top-1 left-1 text-sm bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold px-3 py-1 rounded-tr-lg rounded-bl-lg shadow-md">
              {Number(product.precio).toLocaleString('es-AR', {
                style: 'currency',
                currency: 'ARS',
              })}
              {product.usd ? ' usd' : ''}
            </div>
          </div>
          <div className="px-4 py-1">
            <h2 className="text-sm font-semibold text-gray-900 md:text-base md:font-bold text-center h-10 md:h-5">{product.nombre}</h2>
            <p className="text-xs text-gray-700 md:text-base"><strong>Marca:</strong> {product.marca}</p>
            <p className="text-xs text-gray-700 md:text-base h-8">
              <strong>Categoría:</strong>  {product.categoria.length > 10 ? `${product.categoria.slice(0, 10)}...` : product.categoria}
            </p>
          </div>
        </div>
        <div className="px-2 pb-1 flex  gap-2 justify-center">
          {false ? ( //modifique para que solo se vea el whatsapp
            <>
              {/* Para pantallas md (menos de xl) */}
              <div className="hidden md:flex xl:hidden justify-around gap-2 text-xs xl:text-sm self-center">
                <Link href={product.n_electronica} passHref
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ver producto en Shop"
                    aria-label="Ver producto en Shop"
                    className="flex items-center w-1/2 gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition duration-200"
                  >
                    <MdStore size={16} /> <span>Shop..</span>
                </Link>
                <button
                  onClick={handleConsult}
                  className={`flex items-center gap-2 px-4 py-2 w-1/2  text-white rounded-lg shadow transition duration-300 ${product.vendido?'bg-slate-500':'bg-primary-whats hover:bg-primary-whatsHover'}`}
                  title="Consultar por WhatsApp"
                  aria-label="Consultar por WhatsApp"
                  type="button"
                >
                  <RiWhatsappLine size={16} /> <span>Cons...</span>
                </button>
              </div>
              {/* Para pantallas xl */}
              <div className="hidden xl:flex justify-around gap-2 text-xs xl:text-sm">
                <Link href={product.n_electronica} passHref
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ver producto en MercadoShop"
                    aria-label="Ver producto en MercadoShop"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition duration-200"
                  >
                    <MdStore size={16} /> <span>MercadoShop</span>
                </Link>
                <button
                  onClick={handleConsult}
                  className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow transition duration-300 ${product.vendido?'bg-slate-500':'bg-primary-whats hover:bg-primary-whatsHover'}`}
                  title="Consultar por WhatsApp"
                  aria-label="Consultar por WhatsApp"
                  type="button"
                  disabled={product.vendido?true:false}
                >
                  <RiWhatsappLine size={16} /> <span>Consultar</span>
                </button>
              </div>
              {/* Para pantallas pequeñas */}
              <div className="flex md:hidden justify-around gap-2">
                <Link href={product.n_electronica} passHref
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ver producto en Shop"
                    aria-label="Ver producto en Shop"
                    className="flex items-center justify-center w-16 h-8 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition duration-200"
                  >
                    <MdStore size={16} />
                </Link>
                <button
                  onClick={handleConsult}
                  className={`flex items-center justify-center w-16 h-8  text-white rounded-md shadow transition duration-300 ${product.vendido?'bg-slate-500':'bg-primary-whats hover:bg-primary-whatsHover'}`}
                  title="Consultar por WhatsApp"
                  aria-label="Consultar por WhatsApp"
                  type="button"
                  disabled={product.vendido?true:false}

                >
                  <RiWhatsappLine size={16} />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={handleConsult}
              className={`flex items-center justify-center w-full px-4 py-2 gap-2   text-white rounded-lg shadow  transition duration-300 ${product.vendido?'bg-slate-500':'bg-primary-whats hover:bg-primary-whatsHover'}`}
              title="Consultar por WhatsApp"
              aria-label="Consultar por WhatsApp"
              type="button"
              disabled={product.vendido?true:false}
              
              >
              <RiWhatsappLine size={16} /> <span>Consultar</span>
            </button>

              )}
        </div>

      </div>
    </div>
  );
};

export default Card;
