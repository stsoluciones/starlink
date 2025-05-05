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

  const icon = { ancho: 20, alto: 20, color: '#ffffff' };
  const texto = `Hola, quería consultar por ${selectedProduct.nombre} (${selectedProduct.cod_producto}).`;
  const enviar = `https://wa.me/+${userData.codigoPais}${userData.contact}?text=${encodeURIComponent(texto)}`;

  return (
    <li className="relative bg-white border border-gray-200 rounded-lg shadow min-h-48 w-44 md:min-w-60 md:min-h-72 list-none">
      <div className="flex justify-center relative" onClick={() => handleProductSelect(selectedProduct)}>
        <button 
          onClick={handleAddToCart} 
          className="absolute top-1 right-1 flex items-center justify-center w-8 h-8 rounded-full text-white z-10 bg-boton-primary hover:bg-boton-primary-hover active:bg-boton-primary-active" 
          aria-label="Agregar al carrito"
          title="Agregar al carrito">
          <IconShoopingCart {...icon} />
        </button>
        <Image 
          src='/images/FotoDestacados.webp' 
          width={80} 
          height={80} 
          className="absolute top-[-15px] left-[-15px] xl:w-14 xl:h-14 w-10 z-10" 
          alt="Producto destacado" 
          loading='lazy' 
          title='Producto destacado' />
        <div className="rounded-lg overflow-hidden p-1">
          <Image 
            className="rounded-lg w-full md:w-48 md:h-48 lg:w-52 lg:h-52" 
            src={selectedProduct.foto_1_1 || '/images/sinFoto.webp'} 
            alt={selectedProduct.nombre} 
            width={150} 
            height={150} 
            loading="lazy" 
            title={selectedProduct.nombre} />
          <Image
            className={`absolute bottom-1 right-1 inline-flex items-center justify-center bg-slate-200 hover:bg-boton-primary-hover active:bg-boton-primary-active rounded-md text-white z-10 `}
            src={selectedProduct.usado? '/images/USADO.webp': '/images/NUEVO.webp'}
            alt={selectedProduct.usado? 'producto usado': 'producto nuevo'}
            title={selectedProduct.usado? 'producto usado': 'producto nuevo'}
            loading="lazy"
            width={selectedProduct.usado ? 112 : 64}
            height={32}
            />
        </div>      
      </div>
      <div className="px-5 pb-2">
        <h2 className="text-xs md:text-sm text-start leading-tight pb-1 font-semibold tracking-tight text-gray-900 capitalize">
          {selectedProduct.titulo_de_producto.length > 26
            ? `${selectedProduct.titulo_de_producto.slice(0, 22)}...`
            : selectedProduct.titulo_de_producto}
        </h2>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs md:text-sm font-bold text-gray-900">{selectedProduct.marca}</p>
          <a 
            href={enviar} 
            className="w-full text-white font-medium rounded-lg text-sm px-3 py-1.5 text-center bg-boton-primary hover:bg-boton-primary-hover active:bg-boton-primary-active" 
            target='_blank' 
            rel="noopener noreferrer" 
            title='Consultar por WhatsApp' 
            aria-label="Consultar por WhatsApp">
            Consulta
          </a>
        </div>
      </div>
    </li>
  );
}

export default CardDestacado;