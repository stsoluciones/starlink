'use client'
import React, { useContext } from 'react';
import toast from 'react-hot-toast';
import IconShoopingCart from '../ShoopingCart/IconShoopingCart';
import userData from '../../constants/userData';
import { CartContext } from '../../Context/ShoopingCartContext';
import Image from 'next/image';

const CardDestacado = ({ selectedProduct, handleProductSelect }) => {
  const [cart, setCart] = useContext(CartContext);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (cart.some(item => item.cod_producto === selectedProduct.cod_producto)) {
      toast.error(`El producto ${selectedProduct.nombre} (cod: ${selectedProduct.cod_producto}) ya está en el carrito.`);
      return;
    }

    setCart([...cart, { ...selectedProduct, quantity: 1 }]);
    toast.success(`Agregado ${selectedProduct.nombre} (cod: ${selectedProduct.cod_producto}) al carrito.`);
  };

  const handleConsult = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(enviar, '_blank');
  };

  const getProductLink = (selectedProduct) => {
    const nombreURL = selectedProduct.nombre.replace(/\s+/g, '_');
    return `${typeof window !== 'undefined' ? window.location.origin : ''}/productos/${nombreURL}`;
  };

  const linkProducto =  getProductLink(selectedProduct);

  const consultMessage = `Hola, quería consultar por ${selectedProduct.nombre} (${selectedProduct.cod_producto}). Link: ${linkProducto}`;
  const enviar = `https://wa.me/+${userData.codigoPais}${userData.contact}?text=${encodeURIComponent(
    consultMessage || userData.textoPredefinido
  )}`;


  return (
    <li className="relative bg-white border border-gray-200 rounded-lg shadow min-h-56 w-52 md:min-w-60 md:min-h-80 list-none">
      <div className="h-full flex flex-col">
        <div
          className="flex justify-center relative h-2/3"
          onClick={() => handleProductSelect(selectedProduct)}
        >
          <button
            onClick={handleAddToCart}
            className="absolute top-1 right-1 flex items-center justify-center w-8 h-8 rounded-full text-white z-10 bg-boton-primary hover:bg-boton-primary-hover active:bg-boton-primary-active"
            aria-label="Agregar al carrito"
            title="Agregar al carrito"
          >
            <IconShoopingCart ancho={20} alto={20} color="#ffffff"  />
          </button>

          <Image
            src="/images/FotoDestacados.webp"
            width={80}
            height={80}
            className="absolute top-[-15px] left-[-15px] xl:w-14 xl:h-14 w-10 z-10"
            alt="Producto destacado"
            loading="lazy"
            title="Producto destacado"
          />

          <div className="rounded-lg overflow-hidden p-1">
            <Image
              className="rounded-lg w-full md:w-48 md:h-48 lg:w-52 lg:h-52 object-contain"
              src={selectedProduct.foto_1_1 || "/images/sinFoto.webp"}
              alt={selectedProduct.nombre}
              width={150}
              height={150}
              loading="lazy"
              title={selectedProduct.nombre}
            />
          </div>
        </div>

        <div className="px-3 pt-1 pb-2 h-1/3 flex flex-col justify-between">
          <div className="h-12 md:h-14 flex flex-col justify-between flex-wrap">
            <h2 className="text-xs md:text-sm font-semibold tracking-tight text-gray-900 capitalize leading-snug text-wrap">
              {selectedProduct.nombre}
            </h2>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 mt-1 px-2">
          <p className="text-xs md:text-sm font-bold text-gray-900">{selectedProduct.marca}</p>
          <button
            onClick={handleConsult}
            className="text-white font-medium rounded-lg text-sm px-3 py-1.5 text-center bg-primary hover:bg-primary-hover active:bg-primary-active"
            target="_blank"
            rel="noopener noreferrer"
            title="Consultar por WhatsApp"
            aria-label="Consultar por WhatsApp"
          >
            Consulta
          </button>
        </div>

      </div>
    </li>
  );
}

export default CardDestacado;