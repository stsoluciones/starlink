'use client';
import React, { useState, useRef, useEffect, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import Image from 'next/image';
import Link from 'next/link';
import Swal from 'sweetalert2';
import Loading from '../../Loading/Loading';
import userBank from '../../constants/userBank';
import producto from '../../../../public/images/sinFoto.webp';
import EmptyCart from '../EmptyCart/EmptyCart';
import { CartContext } from '../../Context/ShoopingCartContext';
import { getInLocalStorage } from '../../../Hooks/localStorage';
import  completarDatosUser  from '../../../Utils/completarDatosUser';
import  handleGuardarPedido  from '../../../Utils/handleGuardarPedido';
import handleComprarMercadoPago from '../../../Utils/handleCompraMercadoPago';
import handleGuardarPedidoMercado from '../../../Utils/handleGuardarPedidoMercado';
import FormularioFactura from '../../Perfil/FormularioFactura';
import { solicitarNuevaDireccion } from '../../Perfil/solicitarNuevaDireccion';

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
  

  const transferInfo = `
            <h2 class="text-lg font-bold mb-2">Información de Transferencia</h2>
            <p>Por favor, realiza la transferencia a la siguiente cuenta:</p>
            <p><strong>Banco: </strong>${userBank.banco}</p>
            <p><strong>Alias: </strong>${userBank.alias}</p>
            <p><strong>CBU: </strong>${userBank.cbu}</p>
            <p><strong>Titular: </strong>${userBank.titular}</p>
            <p><strong>Monto Total: </strong>${cart.reduce((acc, item) => acc + item.precio * item.quantity, 0).toLocaleString('es-AR', {
              style: 'currency',
              currency: 'ARS',
            })}</p>
            <p class="mt-4">Una vez realizada la transferencia, por favor envíanos el comprobante a nuestro correo electrónico.</p>
          `;


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
    
    // Primero completar los datos del usuario SIEMPRE
    const userCompleto = await completarDatosUser(user, setUser);
    
    // Verificar que todos los campos obligatorios estén completos
    if (!userCompleto.nombreCompleto || !userCompleto.telefono || !userCompleto.direccion) {
      throw new Error('Debes completar todos tus datos personales para continuar');
    }

    // Preguntar por método de pago
    const result = await Swal.fire({
      title: '¿Cómo deseas pagar?',
      icon: 'question',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonText: 'MercadoPago',
      cancelButtonText: 'Transferencia',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      // Procesar pago con MercadoPago
      //console.log('cart:', cart);
      //console.log('userCompleto:', userCompleto);

      const facturaPrompt = await Swal.fire({
            title: '¿Es consumidor final?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No, necesito factura',
            reverseButtons: true,
          });

      if (facturaPrompt.isConfirmed) {
        userCompleto.factura = { tipo: 'B', condicionIva: 'consumidorFinal' };
        } else {
            // ✅ Preguntar tipo de factura
            const tipoFactura = await Swal.fire({
              title: 'Selecciona el tipo de factura',
              input: 'select',
              inputOptions: {
                'A': 'Factura A',
                'B': 'Factura B',
                'C': 'Factura C',
              },
              inputPlaceholder: 'Selecciona un tipo',
              showCancelButton: true,
            });

            if (!tipoFactura.isConfirmed) throw new Error('Debes seleccionar un tipo de factura');

              // ✅ Verificar si tiene datos de factura
          const tieneFactura =
            userCompleto.factura?.tipo &&
            userCompleto.factura?.razonSocial &&
            userCompleto.factura?.cuit &&
            userCompleto.factura?.condicionIva &&
            userCompleto.factura?.domicilio &&
            userCompleto.factura?.codigoPostal;

          if (!tieneFactura) {
            // Mostrar modal para completar factura
            const datosFactura = await new Promise((resolve) => {
              Swal.fire({
                html: '<div id="form-factura"></div>',
                showCancelButton: true,
                showConfirmButton: false,
                didOpen: () => {
                  const root = document.getElementById('form-factura');
                  const container = document.createElement('div');
                  root.appendChild(container);

                  const rootReact = createRoot(container);
                  rootReact.render(
                    <FormularioFactura
                      tipo={tipoFactura.value}
                      onSubmit={(data) => {
                        resolve(data);
                        Swal.close();
                      }}
                      onCancel={() => {
                        resolve(null);
                        Swal.close();
                      }}
                    />
                  );
                },
              });
            });

            if (!datosFactura) throw new Error('Debes completar los datos de facturación');

            userCompleto.factura = { ...datosFactura };
          } else {
            userCompleto.factura.tipo = tipoFactura.value;
          }
        }

      // ✅ Dirección de envío
      const direccionPrompt = await Swal.fire({
        title: '¿Usar dirección de perfil para el envío?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No, ingresar otra',
        reverseButtons: true,
      });

      if (direccionPrompt.isDismissed) {
        // Pedir nueva dirección (puedes crear un componente como FormularioDireccion)
        const nuevaDireccion = await solicitarNuevaDireccion(); // debes implementar esta función
        if (!nuevaDireccion) throw new Error('Debes ingresar una dirección de envío');
          userCompleto.direccionEnvio = nuevaDireccion;
        } else {
          userCompleto.direccionEnvio = userCompleto.direccion;
        }

      // console.log('userCompleto:', userCompleto);
      
      const compraResponse = await handleComprarMercadoPago(cart, userCompleto);
      if (!compraResponse.ok) {
        throw new Error("Falló la creación de la orden con MercadoPago");
      }
      
      const compraData = await compraResponse.json();
      if (compraData.init_point) {
        //console.log('init_point:', compraData.init_point);
        console.log('userCompleto:', userCompleto);
        //console.log('cart:', cart);
        await handleGuardarPedidoMercado(userCompleto, cart, compraData);
        window.location.href = compraData.init_point;
        setCart([]);
      } else {
        throw new Error("No se pudo obtener el init_point");
      }
    } else if (result.isDismissed) {
      // Procesar transferencia bancaria
      const guardarPedidoData = await handleGuardarPedido(userCompleto, cart);
      
      if (!guardarPedidoData.success) {
        console.error("Detalles del error:", guardarPedidoData.error);
        throw new Error(guardarPedidoData.error || 'No se pudo guardar el pedido');
      }
      
      // Mostrar información de transferencia
      await Swal.fire({
        title: 'Transferencia Bancaria',
        html: transferInfo,
        icon: 'info',
        confirmButtonText: 'Aceptar',
      });
      await Swal.fire({
        title:'Quiere subir el comprobante de la transferencia ahora?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, subir comprobante',
        cancelButtonText: 'No, lo haré después',
        reverseButtons: true,
      })
      //.then(async (result) => {
        // if (result.isConfirmed) {
        //   // Aquí puedes implementar la lógica para subir el comprobante
        //   // Por ejemplo, abrir un modal o redirigir a una página de carga
        //   Swal.fire({
        //     title: 'Subir Comprobante',
        //     html: '<input type="file" id="comprobante" accept="image/*" class="swal2-input">',
        //     preConfirm: () => {
        //       const fileInput = document.getElementById('comprobante');
        //       if (!fileInput.files.length) {
        //         Swal.showValidationMessage('Por favor, selecciona un archivo');
        //         return false;
        //       }
        //       const file = fileInput.files[0];

        //       // Aquí puedes implementar la lógica para subir el archivo al servidor
        //       // Por ejemplo, usando fetch o axios
        //       // return uploadComprobante(file); // Debes implementar esta función
        //     },
        //     confirmButtonText: 'Subir Comprobante',
        //     showLoaderOnConfirm: true,

        //   });
        // } else {
        //   Swal.fire({
        //     title: 'Comprobante no subido',
        //     text: 'Puedes subir el comprobante más tarde desde tu perfil.',
        //     icon: 'info',
        //     confirmButtonText: 'Aceptar',
        //   });
        // }
      //})
      
      // Limpiar carrito después de éxito
      setCart([]);
    }
  } catch (error) {
    console.error("Error en el proceso de compra:", error);
    Swal.fire({
      icon: 'error',
      title: 'Error en la compra',
      text: error.message || 'Ocurrió un error al procesar tu compra',
    });
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
              <button onClick={handleComprar} disabled={loading} className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg w-full" title="Finalizar compra" aria-label="Finalizar compra">
                {loading ? <Loading /> : 'Finalizar Compra'}
              </button>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
};

export default ShopCart;
