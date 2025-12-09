'use client';
import { useState, useRef, useEffect, useContext, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Swal from 'sweetalert2';
import Loading from '../../Loading/Loading';
import userBank from '../../constants/userBank';
import producto from '../../../../public/images/sinFoto.webp';
import EmptyCart from '../EmptyCart/EmptyCart';
import { CartContext } from '../../Context/ShoopingCartContext';
import { getInLocalStorage } from '../../../Hooks/localStorage';
import handleGuardarPedido  from '../../../Utils/handleGuardarPedido';
import handleComprarMercadoPago from '../../../Utils/handleCompraMercadoPago';
import handleGuardarPedidoMercado from '../../../Utils/handleGuardarPedidoMercado';
import FormularioFactura from '../../Perfil/FormularioFactura';
import { solicitarNuevaDireccion } from '../../Perfil/solicitarNuevaDireccion';
// notificador replaced by idempotent server endpoint /api/pedidos/notificar/:id
import notificarError from '../../../Utils/notificarError';

const ShopCart = () => {
  const router = useRouter();
  const [cart, setCart] = useContext(CartContext);
  const [descuento, setDescuento] = useState(0);
  const [transfer, setTransfer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const preguntarRef = useRef(null);
  const totalRef = useRef(null)

  const formatCurrency = (num) =>
      num.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

useEffect(() => {
  if (typeof window !== "undefined") {
    const userFromStorage = getInLocalStorage('USER');
    //console.log('user:', userFromStorage);
    setUser(userFromStorage);
  }
}, []);
  

const handleComprar = async (nuevoDescuento) => {
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
    // console.log('descuento:',descuento);
    // console.log('nuevoDescuento:',nuevoDescuento);
    
    const facturaPrompt = await Swal.fire({
      title: '¿Es consumidor final?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Consumidor Final',
      cancelButtonText: 'Empresa',
      reverseButtons: true,
      allowOutsideClick: true,
    });

    const esConsumidorFinal = facturaPrompt.isConfirmed;
    const tipoFactura = esConsumidorFinal ? 'B' : 'A';

    const datosFactura = await new Promise((resolve) => {
      Swal.fire({
        html: '<div id="form-factura"></div>',
        showConfirmButton: false,
        didOpen: () => {
          const root = document.getElementById('form-factura');
          const container = document.createElement('div');
          root.appendChild(container);
          const rootReact = createRoot(container);
          rootReact.render(
            <Suspense fallback={<Loading />}>
              <FormularioFactura tipo={tipoFactura} esConsumidorFinal={esConsumidorFinal} onSubmit={(data) => resolve(data)} onCancel={() => resolve(null)} />
            </Suspense>
          );
        },
      });
    });

    if (!datosFactura) throw new Error('Debes completar los datos de facturación');
    
    const userCompleto = {
      ...user,
      factura: { ...datosFactura, tipo: tipoFactura, cuit: datosFactura.cuit || datosFactura.dniOCuit },
    };

    const nuevaDireccion = await solicitarNuevaDireccion();
    if (!nuevaDireccion) throw new Error('Debes ingresar una dirección de envío');
    userCompleto.direccionEnvio = nuevaDireccion;
    
    // Subtotal
    const rawSubtotal = totalRef.current?.textContent?.replace('Subtotal: ', '').replace(/\./g, '').replace(',', '.').replace('$', '').trim();
    const subtotalNumber = parseFloat(rawSubtotal);

    const transferenciaPrecio = subtotalNumber * (1 - (nuevoDescuento / 100));
    setTransfer(transferenciaPrecio);
    const mercadoPagoPrecio = subtotalNumber;

    const result = await Swal.fire({
      title: '¿Cómo deseas pagar?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Tarjeta',
      cancelButtonText: 'Transferencia',
      reverseButtons: true,
      html: nuevoDescuento !== 0 ? `
        <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 1rem;">
          <span style="color: #15803d;">Transferencia (${nuevoDescuento}% OFF)</span>
          <span>Tarjeta</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 1.2rem;">
          <span style="color: #15803d;">${formatCurrency(transferenciaPrecio)}</span>
          <span>${formatCurrency(mercadoPagoPrecio)}</span>
        </div>
      ` : `
        <div style="font-size: 1.2rem; margin-top: 1rem;">
          <span>${formatCurrency(mercadoPagoPrecio)}</span>
        </div>
      `,
    });

          const transferInfo = `
            <h2 class="text-lg font-bold mb-2">Información de Transferencia</h2>
            <p>Por favor, realiza la transferencia a la siguiente cuenta:</p>
            <p><strong>Banco: </strong>${userBank.banco}</p>
            <p>
              <strong>Alias: </strong>
              <span id="aliasTexto">${userBank.alias}</span>
              <button id="btnCopiarAlias" style="margin-left: 8px; background: none; border: none; cursor: pointer;" title="Copiar alias">
                <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="#F3781B">
                  <path d="M0 0h24v24H0V0z" fill="none"/>
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
              </button>
            </p>
            <p><strong>CBU: </strong>${userBank.cbu}</p>
            <p><strong>Titular: </strong>${userBank.titular}</p>
            <p><strong>Monto Total: </strong>${formatCurrency(transferenciaPrecio)}</p>
            <p class="mt-4">Una vez realizada la transferencia, por favor envíanos el comprobante a nuestro correo electrónico.</p>
          `;
          

    userCompleto.nombreCompleto = userCompleto.nombreCompleto || userCompleto.displayName || userCompleto.factura.razonSocial;
    userCompleto.dniOCuit = userCompleto.dniOCuit || userCompleto.factura.cuit || userCompleto.documento || ''; 
    userCompleto.telefono = userCompleto.telefono || userCompleto.direccionEnvio.telefono || userCompleto.telefono || '';
    userCompleto.correo = userCompleto.correo || userCompleto.correo || userCompleto.email || '';
    userCompleto.direccion = userCompleto.direccionEnvio 

    // Pre-check userCompleto required fields before attempting to guardarPedido
    const requiredFields = ['nombreCompleto', 'telefono', 'direccion', 'correo'];
    const missing = requiredFields.filter((f) => {
      if (f === 'direccion') return !userCompleto.direccion || Object.keys(userCompleto.direccion).length === 0;
      return !userCompleto[f] || (typeof userCompleto[f] === 'string' && userCompleto[f].trim() === '');
    });

    if (missing.length > 0) {
      console.debug('handleComprar - userCompleto missing fields:', missing, 'userCompleto:', userCompleto);
      await Swal.fire({
        icon: 'warning',
        title: 'Faltan datos para completar la compra',
        html: `Faltan los siguientes campos: <strong>${missing.join(', ')}</strong>. Completa tu perfil antes de continuar.`,
      });
      setLoading(false);
      return;
    }
    if (result.isConfirmed) {
      const compraResponse = await handleComprarMercadoPago(cart, userCompleto);
  console.log('handleComprar - compraResponse (raw):', compraResponse);
      if (!compraResponse.ok) throw new Error("Falló la creación de la orden con MercadoPago");

      const compraData = await compraResponse.json();
      if (!compraData.init_point) throw new Error("No se pudo obtener el init_point");

      await handleGuardarPedidoMercado(userCompleto, cart, compraData);
      setCart([]);
      window.location.href = compraData.init_point;

    } else if (result.isDismissed) {
      
  console.log('handleComprar - calling handleGuardarPedido with:', { userCompleto, cart, nuevoDescuento });
  const guardarPedidoData = await handleGuardarPedido(userCompleto, cart, nuevoDescuento);
  console.log('handleComprar - guardarPedidoData result:', guardarPedidoData);
      if (!guardarPedidoData.success) throw new Error(guardarPedidoData.error || 'No se pudo guardar el pedido');

      await Swal.fire({
          title: 'Transferencia Bancaria',
          icon: 'info',
          html: transferInfo,
          didOpen: () => {
            const btnCopiar = document.getElementById('btnCopiarAlias');
            const aliasTexto = document.getElementById('aliasTexto')?.textContent;

            btnCopiar?.addEventListener('click', () => {
              if (aliasTexto) {
                navigator.clipboard.writeText(aliasTexto.trim()).then(() => {
                  Swal.fire({
                    icon: 'success',
                    title: 'Alias copiado',
                    text: `"${aliasTexto.trim()}" fue copiado al portapapeles`,
                    timer: 2000,
                    showConfirmButton: false,
                  });
                }).catch(() => {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error al copiar',
                    text: 'No se pudo copiar el alias',
                    timer: 2000,
                    showConfirmButton: false,
                  });
                });
              }
            });
          },
        });

      const { isConfirmed: subirAhora } = await Swal.fire({
        title: '¿Quieres subir el comprobante ahora?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, subir comprobante',
        cancelButtonText: 'No, lo haré después',
        reverseButtons: true,
      });

      if (subirAhora) {
        const { value: formValues } = await Swal.fire({
          title: 'Subir Comprobante',
          html: `
            <input type="text" id="nroComprobante" class="swal2-input" placeholder="Número de comprobante">
            <input type="file" id="comprobante" accept="application/pdf,image/png,image/jpeg" class="swal2-file">
          `,
          focusConfirm: false,
          showCancelButton: true,
          confirmButtonText: 'Subir',
          preConfirm: async () => {
            const fileInput = document.getElementById('comprobante');
            const nroInput = document.getElementById('nroComprobante');

            if (!fileInput?.files?.length || !nroInput?.value.trim()) {
              Swal.showValidationMessage('Debes ingresar el número de comprobante y seleccionar un archivo.');
              return;
            }

            const formData = new FormData();
            formData.append('file', fileInput.files[0]);
            formData.append('numeroComprobante', nroInput.value.trim());
            formData.append('pedidoId', guardarPedidoData.orderId);

            try {
              const res = await fetch('/api/pedidos/guardar-ticket', {
                method: 'POST',
                body: formData,
              });

              const data = await res.json();
              if (!res.ok || !data.success) throw new Error(data?.error || 'Error al subir comprobante');
              return data;
            } catch (err) {
              Swal.showValidationMessage(`Error al subir el comprobante: ${err.message}`);
              return;
            }
          },
        });

        if (formValues?.success) {
          await Swal.fire({
            title: 'Comprobante subido',
            text: 'Tu comprobante fue enviado correctamente.',
            icon: 'success',
          });
        }
        
      } else {
        await Swal.fire({
          title: 'Comprobante no subido',
          text: 'Puedes subirlo más tarde desde tu perfil.',
          icon: 'info',
        });
      }
  // Llamada idempotente: notificar y marcar en servidor (evita duplicados)
  fetch(`/api/pedidos/notificar/${guardarPedidoData.orderId}`, { method: 'POST' }).catch(e => console.warn('no se pudo notificar pedido despues de guardar:', e));
      setCart([]);
    }
  } catch (error) {
    console.error("Error en el proceso de compra:", error);
    try {
      // enviar notificación al admin con detalle del error
      await notificarError({
        subject: 'Error en proceso de compra (ShopCart)',
        message: error.message || String(error),
        stack: error.stack || null,
        component: 'ShopCart.handleComprar',
        extra: { cart: cart || [], user: user || null },
      });
    } catch (notifyErr) {
      // no bloquear el flujo si falla la notificación
      console.error('Error al notificar al admin:', notifyErr);
    }

    Swal.fire({
      icon: 'error',
      title: 'Error en la compra',
      text: error.message || 'Ocurrió un error al procesar tu compra',
    });
  } finally {
    setLoading(false);
    router.push('/Dashboard');
  }
};

const handleFinalizarCompra = async () => {
  const nuevoDescuento = await cart[0]?.descuento ?? 0;
  setDescuento(nuevoDescuento);
  handleComprar(nuevoDescuento); 
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
  //console.log('totalRef:',totalRef.current?.textContent?.replace('Subtotal: ', '') || '');
  
  return (
    <section className="flex flex-col items-center md:items-start mb-6">
        <article className="flex flex-col max-w-7xl m-2 self-center">
          <div className="flex items-end p-4">
            <Link href="/" title="Volver a la tienda" aria-label="Volver a la tienda" className="text-gray-500 bg-transparent hover:bg-gray-200 rounded-lg w-10 h-10 flex justify-center items-center">
              <svg className="w-5 h-5" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
              </svg>
            </Link>
          </div>
        <h1 className="md:text-3xl text-xl font-bold text-primary text-center mb-6 md:mb-10 max-w-7xl mx-auto">CARRITO DE COMPRAS</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4  max-w-7xl mx-auto">
          <div className="flex flex-col ">
            {cart.length ? (
              cart.map((item) => (
                <div key={item.cod_producto} className=" w-full relative flex items-center shadow-xl rounded-lg bg-white border border-gray-50 gap-2 m-2 p-2">
                  <Image 
                    src={item.foto_1_1 || producto.src} 
                    alt={item.nombre} 
                    title={item.nombre} 
                    width={112} 
                    height={112} 
                    className="m-2 max-h-28 max-w-28 min-h-28 min-w-28" 
                    loading="lazy" 
                    unoptimized={true}
                    placeholder="blur"
                    blurDataURL="/icons/icon-512x512.png"
                  />
                  <div className="flex flex-col text-sm md:text-base p-2">
                    <p>{item.nombre}</p>
                    <p>{item.cod_producto}</p>
                    <div className="absolute bottom-2 right-2 flex justify-center items-center">
                      <button className='text-gray-700 cursor-pointer font-bold text-2xl px-2' onClick={() => handleDelete(item)} title="Disminuir cantidad"  aria-label="Disminuir cantidad">−</button>
                      <div className="px-2">
                        <span className="text-blue-700 font-semibold text-3xl p">{item.quantity}</span>
                      </div>
                      <button className='text-gray-700 cursor-pointer font-bold text-2xl px-2' onClick={() => handleAdd(item)} title="Aumentar cantidad"  aria-label="Aumentar cantidad">+</button>
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
              <div className="py-4 px-2 flex flex-col md:flex-row justify-between items-center text-center uppercase">
                <Link href="/#productos" className="h-10 w-full text-base p-2 text-white bg-secondary hover:bg-primary-hover rounded-lg" title="Continuar seleccionando ITEMS">
                  Agregar + ITEMS
                </Link>
                <button onClick={handleDeleteAll} className="underline my-5 block text-sm hover:text-red-600 "  title="Vaciar carrito" aria-label="Vaciar carrito">
                  VACIAR CARRITO
                </button>
              </div>
            )}
          </div>

          <div className="">
            <div id="resumen" className="bg-slate-100 rounded-lg shadow-xl p-7 relative flex flex-col justify-between" style={{ alignSelf: "start" }}>
              <h2 className="text-2xl mb-2">Resumen de Compra</h2>
              <div className="grid grid-cols-1  flex-grow-1 ">
                <span ref={totalRef}>
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
                <button
                  onClick={handleFinalizarCompra}
                  disabled={loading}
                  className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg w-full"
                  title="Finalizar compra"
                  aria-label="Finalizar compra"
                >
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
