'use client';
import ReactDOM from 'react-dom';
import React, { useState, useRef, useEffect, useContext } from 'react';
import producto from '../../../../public/images/sinFoto.webp';
import Link from 'next/link';
import EmptyCart from '../EmptyCart/EmptyCart';
import { CartContext } from '../../Context/ShoopingCartContext';
import Swal from 'sweetalert2';
import Image from 'next/image';
import { getInLocalStorage } from '../../../Hooks/localStorage';
import Loading from '../../Loading/Loading';
import { FormularioEnvio } from '../../Perfil/FormularioEnvio';

const ShopCart = () => {
  const [cart, setCart] = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const preguntarRef = useRef(null);

useEffect(() => {
  if (typeof window !== "undefined") {
    const userFromStorage = getInLocalStorage('USER');
    //console.log('user:', userFromStorage);
    setUser(userFromStorage);
  }
}, []);
  
const handleComprar = async () => {
  if (cart.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'El carrito está vacío',
      text: 'Agrega productos al carrito antes de continuar.',
    });
    return;
  }

  if (!user) {
    Swal.fire({
      icon: 'warning',
      title: 'Inicia sesión para continuar',
      text: 'Debes iniciar sesión para realizar la compra.',
    });
    return;
  }

  try {
    setLoading(true);
    
    // 1. Obtener información completa del usuario desde la API
    const userResponse = await fetch(`/api/usuarios/${user.uid}`, {
      method: 'GET',
      credentials: 'include', // Importante para enviar las cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      throw new Error('Error al obtener datos del usuario');
    }

    const userData = await userResponse.json();
    
    // 2. Verificar campos obligatorios con los datos completos
    const requiredFields = {
      personales: ['nombreCompleto', 'telefono', 'dniOCuit'],
      direccion: ['pais', 'provincia', 'ciudad', 'calle', 'numero', 'codigoPostal']
    };

    const missingPersonalFields = requiredFields.personales.filter(
      field => !userData[field] || userData[field]?.trim() === ''
    );

    const missingAddressFields = requiredFields.direccion.filter(
      field => !userData.direccion?.[field] || userData.direccion[field]?.trim() === ''
    );

    const allMissingFields = [...missingPersonalFields, ...missingAddressFields];
    const totalRequiredFields = [...requiredFields.personales, ...requiredFields.direccion].length;
    const completedFields = totalRequiredFields - allMissingFields.length;
    const progress = Math.round((completedFields / totalRequiredFields) * 100);

    // 3. Mostrar modal si faltan datos
    if (allMissingFields.length > 0) {
      const { value: action } = await Swal.fire({
        title: 'Datos incompletos',
        html: `
          <div>
            <p>Para continuar con la compra, necesitamos que completes tu información de envío:</p>
            <div class="w-full bg-gray-200 rounded-full h-4 mb-4 mt-4">
              <div class="bg-blue-600 h-4 rounded-full" style="width: ${progress}%"></div>
            </div>
            <p class="text-sm text-gray-600">${completedFields} de ${totalRequiredFields} campos completados (${progress}%)</p>
            ${allMissingFields.length > 0 ? `<p class="text-xs text-red-500 mt-2">Faltan: ${allMissingFields.join(', ')}</p>` : ''}
          </div>
        `,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Completar ahora',
        cancelButtonText: 'Más tarde',
        reverseButtons: true
      });

      if (action) {
        // Mostrar formulario de edición
        const { value: formValues } = await Swal.fire({
          title: 'Completa tus datos',
          html: `<div id="formulario-envio-container"></div>`,
          showConfirmButton: false,
          showCancelButton: false,
          width: '800px',
          willOpen: () => {
            const container = document.getElementById('formulario-envio-container');
            ReactDOM.render(
              <FormularioEnvio
                user={userData}
                missingFields={allMissingFields}
                onCancel={() => Swal.close()}
                onSubmit={async (data) => {
                  try {
                    const response = await fetch(`/api/usuarios/${user.uid}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                      credentials: 'include'
                    });
                    
                    if (!response.ok) throw new Error('Error al actualizar los datos');
                    
                    const updatedUser = await response.json();
                    setUser(updatedUser); // Actualizar estado local si es necesario
                    Swal.close();
                    
                    // Volver a intentar la compra con los nuevos datos
                    handleComprar();
                  } catch (error) {
                    Swal.fire('Error', 'No se pudieron guardar los datos. Por favor intenta nuevamente.', 'error');
                  }
                }}
              />,
              container
            );
          },
          willClose: () => {
            const container = document.getElementById('formulario-envio-container');
            if (container) {
              ReactDOM.unmountComponentAtNode(container);
            }
          }
        });
      }
      return;
    }

    // 4. Si todos los datos están completos, proceder con la compra
    const compraResponse = await fetch("/api/crear-preferencia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        cart, 
        uid: user.uid,
        shippingInfo: { // Enviar información de envío completa
          ...userData.direccion,
          nombreCompleto: userData.nombreCompleto,
          telefono: userData.telefono
        }
      }),
    });

    const compraData = await compraResponse.json();

    if (compraData.init_point) {
      setCart([]);
      window.location.href = compraData.init_point;
    } else {
      console.error("No se pudo obtener el init_point");
      Swal.fire('Error', 'No se pudo procesar el pago', 'error');
    }

  } catch (error) {
    console.error("Error en el proceso de compra:", error);
    Swal.fire('Error', 'Ocurrió un error al procesar tu compra', 'error');
  } finally {
    setLoading(false);
  }
};


  //console.log('cart:',cart)

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

  const handleAdd = (producto) => {
    setCart((currItems) =>
      currItems.map((item) =>
        item.cod_producto === producto.cod_producto
          ? { ...item, quantity: item.quantity + 1 }
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
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

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
        <h1 className="md:text-3xl text-xl font-bold text-primary text-center mb-6 md:mb-10">CARRITO DE COMPRAS</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="flex flex-col m">
            {cart.length ? (
              cart.map((item) => (
                <div key={item.cod_producto} className="relative flex items-center shadow-xl rounded-lg bg-white border border-gray-50 gap-2 m-2 p-2">
                  <Image src={item.foto_1_1 || producto.src} alt={item.nombre} title={item.nombre} width={112} height={112} className="m-2 max-h-28 max-w-28 min-h-28 min-w-28" loading="lazy" />
                  <div className="flex flex-col text-sm md:text-base p-2">
                    <p>{item.nombre}</p>
                    <p>{item.cod_producto}</p>
                    <div className="flex items-center gap-2 mt-2 justify-end">
                      <button className='text-gray-700 cursor-pointer font-bold text-xl' onClick={() => handleDelete(item)} title="Disminuir cantidad"    aria-label="Disminuir cantidad">−</button>
                      <span className="text-blue-700 font-semibold">{item.quantity}</span>
                      <button className='text-gray-700 cursor-pointer font-bold text-xl' onClick={() => handleAdd(item)} title="Aumentar cantidad"       aria-label="Aumentar cantidad">+</button>
                    </div>
                    <button onClick={() => handleDelete(item)} className="absolute top-2 right-2 text-gray-500 bg-transparent hover:bg-red-400 rounded-lg w-6 h-6 flex justify-center items-center" title="Quitar del carrito" aria-label="Quitar del carrito">
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
                <Link href="/#productos" className="h-10 w-full text-base p-2 text-white bg-secondary hover:bg-secondary-hover rounded-lg" title="Continuar seleccionando ITEMS">
                  Continuar agregando ITEMS
                </Link>
                <button onClick={handleDeleteAll} className="col-span-2 underline my-5 block text-sm"  title="Vaciar carrito" aria-label="Vaciar carrito">
                  VACIAR CARRITO
                </button>
              </div>
            )}
          </div>

          <div className="">
            <div id="resumen" className="bg-slate-100 rounded-lg shadow-xl p-7 relative flex flex-col justify-between" style={{ alignSelf: "start" }}>
              <h2 className="text-2xl mb-2">Resumen de Compra</h2>
              <div className="grid grid-cols-1  flex-grow">
                <span>
                  <strong>Subtotal: </strong>
                  {cart.reduce((acc, item) => acc + item.precio * item.quantity, 0).toLocaleString('es-AR', {
                    style: 'currency',
                    currency: 'ARS',
                  })}
                </span>
                <span><strong>Cant. de productos en el carrito: </strong>{totalItems}</span>
                <span><strong>Usted va a COMPRAR: </strong></span>
                <span id="preguntar" ref={preguntarRef}>
                  <br />
                  {cart.map((item) => (
                    <span key={item.cod_producto} className="text-right">{item.nombre} - cod: {item.cod_producto}<br /></span>
                  ))}
                </span>
              </div>
              <div className="flex justify-between items-center mt-4"></div>
              <button onClick={handleComprar} className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-center text-white bg-boton-primary hover:bg-boton-primary-hover active:bg-boton-primary-active w-full rounded-lg"
                aria-label="contactar por todo el carrito">{loading?<Loading/>:'COMPRAR'}</button>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
};

export default ShopCart;
