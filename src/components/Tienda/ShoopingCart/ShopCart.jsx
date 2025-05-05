'use client';
import React, { useState, useRef, useEffect, useContext } from 'react';
import producto from '../../../../public/images/sinFoto.webp';
import Link from 'next/link';
import userData from '../../constants/userData';
import EmptyCart from '../EmptyCart/EmptyCart';
import { CartContext } from '../../Context/ShoopingCartContext';
import Swal from 'sweetalert2';
import Image from 'next/image';

const ShopCart = () => {
  const [cart, setCart] = useContext(CartContext);
  const [consulta, setConsulta] = useState('');
  const preguntarRef = useRef(null);
  const enviar = `https://wa.me/+${userData.codigoPais}${userData.contact}?text=${encodeURIComponent(consulta || userData.textoPredefinido)}`;

  useEffect(() => {
    if (consulta) window.open(enviar, '_blank');
  }, [consulta]);

  const handleConsulta = () => {
    setConsulta(preguntarRef.current.innerText);
    setCart([]);
  };

  const handleDelete = (producto) => {
    setCart((currItems) =>
      currItems.find((item) => item.cod_producto === producto.cod_producto)?.quantity === 1
        ? currItems.filter((item) => item.cod_producto !== producto.cod_producto)
        : currItems.map((item) =>
            item.cod_producto === producto.cod_producto
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
    );
  };

  const handleDeleteAll = (e) => {
    e.preventDefault();
    Swal.fire({
      icon: 'warning',
      title: '¿Estás seguro de vaciar el carrito?',
      showCancelButton: true,
      confirmButtonText: 'ELIMINAR',
    }).then((result) => {
      if (result.isConfirmed) setCart([]);
    });
  };

  return (
    <section className="flex flex-col items-center md:items-start mb-6">
        <article className="flex flex-col max-w-[1200px] m-2 self-center">
          <div className="flex items-end p-4">
            <Link href="/" title="Volver a la tienda" aria-label="Volver a la tienda" className="text-gray-500 bg-transparent hover:bg-gray-200 rounded-lg w-10 h-10 flex justify-center items-center">
              <svg className="w-5 h-5" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
              </svg>
            </Link>
          </div>
        <h1 className="md:text-3xl text-xl font-bold text-primary text-center mb-6 md:mb-10">CARRITO DE CONSULTAS</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="flex flex-col">
            {cart.length ? (
              cart.map((item) => (
                <div key={item.cod_producto} className="relative flex items-center shadow-xl rounded-lg bg-white border border-gray-50 gap-2 m-2 p-2">
                  <Image src={item.foto_1_1 || producto.src} alt={item.nombre} title={item.nombre} width={112} height={112} className="m-2 max-h-28 max-w-28 min-h-28 min-w-28" loading="lazy" />
                  <div className="flex flex-col text-sm md:text-base p-2">
                    <p>{item.nombre}</p>
                    <p>{item.descripcion}</p>
                    <p>{item.cod_producto}</p>
                    <button onClick={() => handleDelete(item)} className="absolute top-2 right-2 text-gray-500 bg-transparent hover:bg-gray-200 rounded-lg w-6 h-6 flex justify-center items-center" title="Quitar del carrito" aria-label="Quitar del carrito">
                      <svg className="w-3 h-3" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyCart />
            )}
            {cart.length > 0 && (
              <div className="py-4 px-2 grid grid-cols-2">
                <button onClick={handleDeleteAll} className="h-10 w-full text-sm font-medium text-white bg-secondary hover:bg-secondary-hover rounded-lg" title="Vaciar carrito" aria-label="Vaciar carrito">
                  VACIAR CARRITO
                </button>
                <Link href="/#productos" className="col-span-2 underline my-5 block" title="Continuar seleccionando ITEMS">
                  Continuar seleccionando ITEMS
                </Link>
              </div>
            )}
          </div>

          <div className="">
            <div
              id="resumen"
              className="bg-slate-100 rounded-lg shadow-xl p-7 relative flex flex-col justify-between"
              style={{ alignSelf: "start" }}
            >
              <h2 className="text-2xl mb-2">Resumen de Consulta</h2>
              <div className="grid grid-cols-1  flex-grow">
               
                <span >
                  <strong>Cant. de productos: </strong> {cart.length}
                </span>
                <span>
                  <strong>Usted va a enviar: </strong>
                </span>
                <span id="preguntar" ref={preguntarRef}>
                  Hola, me gustaría consultar precio y disponibilidad de los
                  siguientes artículos:
                  <br />
                  {cart.map((item) => (
                    <span key={item.cod_producto} className="text-right">
                      {item.nombre} - cod: {item.cod_producto} <br />
                    </span>
                  ))}
                </span>
              </div>
              <div className="flex justify-between items-center mt-4"></div>
              <button
                onClick={handleConsulta}
                className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-center text-white bg-boton-primary hover:bg-boton-primary-hover active:bg-boton-primary-active w-full rounded-lg"
                aria-label="contactar por todo el carrito"
              >
                CONTACTAR
                <svg
                  className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
                  aria-label="contactar por todo el carrito"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 5h12m0 0L9 1m4 4L9 9"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
};

export default ShopCart;
