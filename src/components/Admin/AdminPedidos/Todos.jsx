import React, { useEffect, useState } from 'react'
import { FaBackward, FaForward } from 'react-icons/fa';
// load Swal lazily to reduce initial bundle size
let Swal
const getSwal = async () => {
  if (!Swal) {
    Swal = (await import('sweetalert2')).default
  }
  return Swal
}
import Loading from '../../Loading/Loading';
// import handleGenerarAndreani from '../../../Utils/handleGenerarAndreani'
import actualizarEstado from '../../../Utils/actualizarEstado';
import Link from 'next/link';
import { toast } from 'react-toastify';
import userData from '../../constants/userData';
import Image from 'next/image';


const Todos = ({search, filtroEstado, setSearch, setFiltroEstado, estados, pedidosPaginados, actualizandoId, setActualizandoId, paginaActual, totalPaginas, handleStados, cambiarPagina, setPedidosProcesando }) => {
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [mostrarFacturaModal, setMostrarFacturaModal] = useState(false);
  const [seleccionados, setSeleccionados] = useState([]);
  const [todosSeleccionados, setTodosSeleccionados] = useState(false);
  const [mostrarEtiquetaModal, setMostrarEtiquetaModal] = useState(false);
  const [etiqueta, setEtiqueta] = useState(null);
  const [confirmarEliminarModal, setConfirmarEliminarModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [trackingFile, setTrackingFile] = useState(null);
  const [mostrarEnvioModal, setMostrarEnvioModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const objectIdRegex = /^[a-f\d]{24}$/i;
  
  const abrirModalFactura = (pedido) => {
    setPedidoSeleccionado(pedido);
    setMostrarFacturaModal(true);
  };

  const cerrarModalFactura = () => {
    setMostrarFacturaModal(false);
    setPedidoSeleccionado(null);
  };

  useEffect(() => {
    const pedidosPagados = pedidosPaginados.filter(p => p.estado === 'pagado').map(p => p._id);
    const todosPagadosSeleccionados =
      pedidosPagados.length > 0 &&
      pedidosPagados.every(id => seleccionados.includes(id));
    setTodosSeleccionados(todosPagadosSeleccionados);
  }, [seleccionados, pedidosPaginados]);


  const manejarSeleccionGeneral = () => {
    const pedidosPagados = pedidosPaginados
      .filter(p => p.estado === 'pagado')
      .map(p => p._id);

    if (todosSeleccionados) {
      // Deseleccionar solo los pagados de esta página
      setSeleccionados(seleccionados.filter(id => !pedidosPagados.includes(id)));
    } else {
      // Agregar los pagados de esta página a los seleccionados
      setSeleccionados([...new Set([...seleccionados, ...pedidosPagados])]);
    }
  };


  if (!pedidosPaginados) return <div className="p-4"><Loading /></div>;
  if (pedidosPaginados.length === 0) { 
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold">No hay pedidos disponibles</h2>
        <p className="text-gray-600">Intenta ajustar los filtros o buscar por otro término.</p>
        <button onClick={() => {setFiltroEstado('todos'); setSearch("")}} className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-primary-hover">
          Limpiar Filtros
        </button>
      </div>
    );
  }

const generarEtiquetas = async (pedidoUnico = null) => {
  // console.log('Generando etiquetas para pedidos:', pedidoUnico);
  // console.log('Pedidos paginados:', pedidosPaginados)
  // console.log('Seleccionados:', seleccionados);
  
  
  const pedidosAActualizar = pedidoUnico
    ? [pedidoUnico]
    : (seleccionados.length > 0
        ? pedidosPaginados.filter(pedido =>
            typeof pedido?._id === "string" && seleccionados.includes(pedido._id)
          )
        : pedidosPaginados);

  if (pedidoUnico === null && seleccionados.length > 0 && pedidosAActualizar.length < seleccionados.length) {
    const encontrados = pedidosAActualizar.map(p => p._id);
    const faltantes = seleccionados.filter(id => !encontrados.includes(id));
    console.warn("⚠️ Algunos IDs seleccionados no fueron encontrados en pedidosPaginados:", faltantes);
  }


    if (pedidosAActualizar.length === 0) {
      (await getSwal()).fire("Atención", "No hay pedidos seleccionados para generar etiquetas.", "info");
      return;
    }

    const pedidosInvalidos = pedidosAActualizar.filter(p => !objectIdRegex.test(p._id));
    if (pedidosInvalidos.length > 0) {
      console.error("Pedidos con IDs malformados:", pedidosInvalidos.map(p => p._id));
      Swal.fire({
        title: 'Error de Datos',
        html: `Se encontraron ${pedidosInvalidos.length} pedido(s) con formato de ID incorrecto. Por favor, revisa la consola para más detalles y corrige los datos en la base de datos.<br/>IDs problemáticos: ${pedidosInvalidos.map(p => p._id).join(', ')}`,
        icon: 'error'
      });
      return;
    }

    try {
  const result = await (await getSwal()).fire({
        title: '¿Estás seguro?',
        text: `Vas a generar etiquetas y actualizar ${pedidosAActualizar.length} pedido(s) a "enviado".`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, generar y actualizar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
      });

  if (!result.isConfirmed) {
  (await getSwal()).fire('Operación Cancelada', 'No se actualizaron los pedidos.', 'info');
        return;
      }

      // Mostrar cargando mientras se generan etiquetas
  (await getSwal()).fire({
        title: 'Procesando...',
        html: `Generando etiquetas para ${pedidosAActualizar.length} pedido(s).`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Generar etiquetas (descomenta y adapta según tu lógica)
      
                      //***************************
      // const etiquetasGeneradas = await handleGenerarAndreani(pedidosAActualizar.map(p => p._id));

      // Mostrar mensaje de éxito y preguntar por impresión
      // const imprimir = await Swal.fire({
      //   title: `Se generaron ${etiquetasGeneradas.length} etiqueta(s).`,
      //   icon: 'success',
      //   showCancelButton: true,
      //   confirmButtonText: 'Imprimir Etiquetas',
      //   cancelButtonText: 'No Imprimir',
      //   reverseButtons: true
      // });

      // if (imprimir.isConfirmed) {
      //   etiquetasGeneradas.forEach(({ pedidoId, etiqueta }) => {
      //     const blob = new Blob(
      //       [Uint8Array.from(atob(etiqueta), c => c.charCodeAt(0))],
      //       { type: 'application/pdf' }
      //     );
      //     const url = URL.createObjectURL(blob);
      //     const link = document.createElement('a');
      //     link.href = url;
      //     link.download = `Etiqueta-${pedidoId}.pdf`;
      //     document.body.appendChild(link);
      //     link.click();
      //     URL.revokeObjectURL(url);
      //     link.remove();
      //   });

       // Swal.fire('Imprimiendo etiquetas...', 'Se guardaron las etiquetas en los pedidos.', 'info');
      // } else {
      //   Swal.fire('Etiquetas no impresas', 'Las etiquetas fueron generadas pero no se imprimieron.', 'info');
      // }

      // Finalmente actualizar el estado de los pedidos
      // Swal.fire({
      //   title: 'Actualizando pedidos...',
      //   html: `Actualizando estado de ${pedidosAActualizar.length} pedido(s).`,
      //   allowOutsideClick: false,
      //   didOpen: () => {
      //     Swal.showLoading();
      //   }
      // });

      // Finalizar
  (await getSwal()).close();
  (await getSwal()).fire('¡Pedidos actualizados!', 'Todos los pedidos fueron marcados como enviados.', 'success');


      const resultados = await Promise.all(
        pedidosAActualizar.map(pedido =>
          actualizarEstado(
            pedido._id,
            "enviado",
            setActualizandoId,
            setPedidosProcesando,
            true,
            userData
          )
        )
      );

      const actualizadosConExito = resultados.filter(r => r && r.success).length;
      
      if (actualizadosConExito > 0) {
        setPedidosProcesando(prevPedidos =>
          prevPedidos.filter(p =>
            !resultados.some(r => r && r.success && r.pedido && r.pedido._id === p._id)
          )
        );
      }

  (await getSwal()).fire({
        title: '¡Éxito!',
        text: `Se actualizaron ${actualizadosConExito} pedido(s) a "enviado".`,
        icon: 'success'
      });

  await Promise.allSettled(
      resultados
        .filter(r => r?.success && r.pedido && r.pedido.email && r.pedido.numeroPedido)
        .map(async (r) => {
          try {
            const response = await fetch('/api/notificador', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                clienteEmail: r.pedido.email,
                clienteNombre: r.pedido.nombreCompleto || 'Cliente',
                estadoPedido: "pagado",
                adminEmail: userData.email, // podés usar una variable si lo querés reutilizar
                numeroPedido: r.pedido.numeroPedido,
                montoTotal: r.pedido.total ?? 0,
              }),
            });

            if (!response.ok) {
              console.error(`❌ Falló notificación para pedido #${r.pedido.numeroPedido}`);
            }
          } catch (error) {
            console.error(`⚠️ Error al notificar pedido #${r.pedido.numeroPedido}:`, error);
          }
        })
    );


      setSeleccionados([]);
      setTodosSeleccionados(false);

    } catch (error) {
      console.error("Error al generar etiquetas y actualizar pedidos:", error);
      (await getSwal()).fire({
        title: 'Error General',
        text: error.message || "Ocurrió un error inesperado durante el proceso.",
        icon: 'error'
      });
    }
  };

  const handleUpload = async (pedido) => {
    if (!trackingFile || !etiqueta) {
      toast.warning('Debes seleccionar un archivo y escribir el número de Tracking.');
      return;
    }

    const formData = new FormData();
    formData.append('file', trackingFile);
    formData.append('numeroTracking', etiqueta.trim());
    formData.append('pedidoId', pedido._id);

    setLoading(true);

    try {
      const res = await fetch('/api/pedidos/guardar-etiqueta', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || 'Error al subir la etiqueta.');
        return;
      }

      toast.success('Etiqueta guardada correctamente.');

      setShowUploadModal(false);
      setTrackingFile(null);
      setEtiqueta('');
      setPedidoSeleccionado(null);
      setMostrarEtiquetaModal(false);
    } catch (error) {
      console.error('Error al subir la etiqueta:', error);
      toast.error('Error de red o del servidor al subir la etiqueta.');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarEtiqueta = async () => {
    if (!pedidoSeleccionado) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/pedidos/eliminar-etiqueta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pedidoId: pedidoSeleccionado._id }),
      });

      // Verificar si la respuesta es JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(`Respuesta inesperada del servidor: ${text.substring(0, 100)}...`);
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || 'Error al eliminar la etiqueta.');
        return;
      }

      toast.success('Etiqueta eliminada correctamente.');
      setMostrarEtiquetaModal(false);
      setConfirmarEliminarModal(false);
      
      // Actualizar el estado local del pedido
      setPedidosPaginados(prev => prev.map(p => 
        p._id === pedidoSeleccionado._id 
          ? { ...p, etiquetaEnvio: undefined, trackingCode: undefined, estado: 'pagado' }
          : p
      ));
      
      setPedidoSeleccionado(null);
      
    } catch (error) {
      console.error('Error al eliminar la etiqueta:', error);
      toast.error(error.message || 'Error de red o del servidor al eliminar la etiqueta.');
    } finally {
      setLoading(false);
    }
  };

  const getUltimos6 = (numero = "") => {
    if (typeof numero !== "string") numero = String(numero ?? "");
    const parte = numero.includes("-") ? numero.split("-").pop() : numero;
    return (parte || "").slice(-6)
  };

  // opcional: formatear fecha seguro
  const fmtFecha = (f) => {
    const d = new Date(f);
    return isNaN(d) ? "-" : d.toLocaleString("es-AR");
  };

  return (
          <section>
          {/* Filtros */}
          <div className="mb-4 flex flex-col sm:flex-row flex-wrap gap-4">
            <input type="text" placeholder="Buscar por nombre, correo o Id" value={search} onChange={(e) => {setSearch(e.target.value); cambiarPagina(1);;}} className="border px-3 py-2 rounded w-full sm:w-60" />
            <select value={filtroEstado} onChange={(e) => {setFiltroEstado(e.target.value); cambiarPagina(1);; }} className="border px-3 py-2 rounded w-full sm:w-auto">
              <option value="todos">Todos los estados</option>
              {estados.map((estado) => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
            <div className="flex gap-2 align-middle items-center">
              <input type="checkbox" id="seleccionarTodos" checked={todosSeleccionados} onChange={manejarSeleccionGeneral}/>
              <label htmlFor="seleccionarTodos" className="font-medium cursor-pointer">Imprimir todas las etiquetas</label>
            </div>
            <button onClick={(e) => { e.preventDefault(); generarEtiquetas()}} disabled={seleccionados.length === 0 || loading } className="bg-blue-600 text-white text-sm p-2 my-2 rounded hover:bg-blue-700 disabled:bg-gray-300">Generar y Enviar ({seleccionados.length})</button>
          </div>

          {/* Tabla de pedidos */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <tbody>
                {pedidosPaginados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-gray-600 py-4">
                      No hay pedidos disponibles.
                    </td>
                  </tr>
                ) : (
                pedidosPaginados
                .filter(p => p.estado !== 'cancelado') 
                .slice()
                .sort((a, b) => new Date(b.fechaPedido) - new Date(a.fechaPedido))
                .map((pedido) => (
                  <tr key={pedido._id} className="border-t">
                    <td colSpan={8} className="p-4">
                      <div className="border rounded-lg shadow-sm p-4 space-y-4">

                        {/* Encabezado: Estado, Fecha y Botón de etiqueta */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
                          <p className="text-xs text-gray-500 md:p-2 md:my-2">{fmtFecha(pedido?.fechaPedido)}</p>
                          <p className="text-sm text-gray-700 md:p-2 md:my-2">Pedido N°: <span className="font-bold">{getUltimos6(pedido?._id)}</span></p>
                          <div className=' flex gap-2 align-middle'>
                            {pedido?.estado !== 'pendiente' && pedido?.estado !== 'cancelado' && (
                              <button onClick={() => generarEtiquetas(pedido)} className="text-white font-semibold bg-orange-500 hover:bg-orange-600 p-1 md:p-2 my-1 md:my-2 rounded-md" >{pedido?.estado === 'pagado' ? 'Imprimir etiqueta' : 'Reimprimir etiqueta'}</button>)}
                            {/* Botón imprimir etiqueta */}
                            {pedido?.metadata?.ticketUrl && pedido?.paymentMethod === 'transferencia' && (
                              <a href={pedido?.metadata.ticketUrl} target="_blank" rel="noopener noreferrer" className={`bg-blue-600 hover:bg-blue-700 text-white text-sm p-1 md:p-2 my-1 md:my-2 rounded`}> ver ticket</a> )}
                          </div>

                          {/* Selector de estado */}
                          <div className="flex flex-col md:flex-row md:items-center gap-2">
                            <select disabled={actualizandoId === pedido._id} className="border rounded px-2 py-1 w-full md:w-auto" value={pedido.estado} onChange={(e) => handleStados(pedido._id, e.target.value)}>
                              {estados.map((estado) => ( <option key={estado} value={estado}>{estado}</option> ))}
                            </select>
                            {actualizandoId === pedido._id && ( <span className="ml-2 text-xs text-gray-500 inline-flex items-center"> Guardando <Loading /></span>)}
                            <p className="text-lg font-semibold text-gray-800">
                              {pedido.total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>

                        {/* Lista de productos */}
                        <div className="flex flex-wrap gap-4">
                          {pedido.metadata?.cart?.map((item, index) => (
                            <div key={index} className="flex items-center border rounded p-2 w-full md:w-auto md:min-w-[250px]">
                              <Image 
                                src={item.foto_1_1 || '/images/sinFoto.webp'} 
                                alt={item.nombre} title={item.nombre} 
                                width={64} height={64}
                                className="w-16 h-16 object-contain mr-4" 
                                unoptimized={true}
                              />
                              <div>
                                <p className="text-sm font-semibold">{item.titulo_de_producto?item.titulo_de_producto:item.nombre_producto}</p>
                                <p className="text-xs text-gray-600">
                                  CANT: <span className="text-red-500 font-bold text-xl">{item.quantity?item.quantity:item.cantidad}</span>
                                </p>
                                <p className="text-xs text-gray-600">
                                  $ : <span className="text-slate-500 font-bold text-xl">{item.precio?item.precio:item.precio_unitario}</span>
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Datos del comprador */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-2 border-t my-4">
                          <div className="">
                            <p className="text-sm text-gray-700">{pedido.tipoFactura?.razonSocial || "Sin nombre"}</p>
                            <p className={`text-sm ${pedido.tipoFactura?.condicionIva === 'consumidorFinal'|| pedido.tipoFactura?.condicionIva === 'Consumidor Final'?'text-gray-500':'text-red-800 text-center px-1 rounded-md font-semibold bg-red-400'} `}>{pedido.tipoFactura?.condicionIva || "Sin nombre"}</p>
                          </div>
                          {/* {console.log('pedido.usuarioInfo', pedido.usuarioInfo)} */}
                          
                          <Link href={`mailto:${pedido.usuarioInfo?.correo}`} className="text-blue-600 hover:underline text-sm" >Enviar Correo</Link>

                          {pedido.direccionEnvio?.telefono?<Link href={`https://wa.me/+54${pedido.direccionEnvio?.telefono}`} className="text-blue-600 hover:underline text-sm" target='_blank' >WhatsApp</Link>:null}

                          <button onClick={() => abrirModalFactura(pedido)} className="bg-primary hover:bg-primary text-white text-sm px-3 py-1 my-1 rounded md:ml-2">
                            Ver datos de Factura
                          </button>
                          <button onClick={() => { setPedidoSeleccionado(pedido);setMostrarEnvioModal(true) }}  className="bg-primary my-1 hover:bg-primary text-white text-sm px-3 py-1 rounded md:ml-2">
                            Ver datos de Envío
                          </button>
                            {pedido.estado === 'enviado' && (
                              <button 
                                onClick={() => {
                                  setPedidoSeleccionado(pedido);
                                  setMostrarEtiquetaModal(true);
                                }}
                                className={`${pedido.etiquetaEnvio ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primary-hover'} text-white my-1 text-sm px-3 py-1 rounded md:ml-2`}
                              >
                                {pedido.etiquetaEnvio ? 'Ver Etiqueta' : 'Adj. Etiqueta'}
                              </button>
                            )}
                            {mostrarEtiquetaModal && pedidoSeleccionado?._id === pedido._id && (
                              <div className="fixed inset-0 bg-black/10 flex justify-center items-center z-50">
                                <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-md">
                                  <h2 className="text-lg font-semibold mb-4">Etiqueta de Envío</h2>
                                  
                                  {pedidoSeleccionado.etiquetaEnvio ? (
                                    <div className="space-y-4">
                                      <div className="flex flex-col items-center">
                                          <Link 
                                            href={pedidoSeleccionado.etiquetaEnvio}
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-white bg-blue-600 py-2 px-4 rounded-md hover:bg-blue-700 text-xs md:text-sm mb-4"
                                          >
                                            Ver Etiqueta
                                          </Link>
                                        <p className="text-sm mb-2">
                                          <strong>Número de Tracking:</strong> {pedidoSeleccionado.trackingCode || 'No disponible'}
                                        </p>
                                      </div>
                                      
                                      <div className="flex flex-col gap-2">
                                        <button 
                                          onClick={() => {
                                            setMostrarEtiquetaModal(false);
                                            setShowUploadModal(true);
                                          }} 
                                          className="text-white bg-yellow-500 py-2 px-4 rounded-md hover:bg-yellow-600 text-xs md:text-sm"
                                        >
                                          Reemplazar Etiqueta
                                        </button>
                                        
                                        <button 
                                          onClick={() => setConfirmarEliminarModal(true)}
                                          className="text-white bg-red-500 py-2 px-4 rounded-md hover:bg-red-600 text-xs md:text-sm"
                                        >
                                          Eliminar Etiqueta
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center">
                                      <button 
                                        onClick={() => {
                                          setMostrarEtiquetaModal(false);
                                          setShowUploadModal(true);
                                        }} 
                                        className="text-white bg-primary py-2 px-4 rounded-md hover:bg-primary-hover text-xs md:text-sm"
                                      >
                                        Adjuntar Etiqueta
                                      </button>
                                    </div>
                                  )}
                                  
                                  <button 
                                    onClick={() => setMostrarEtiquetaModal(false)} 
                                    className="mt-4 w-full bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
                                  >
                                    Cerrar
                                  </button>
                                </div>
                              </div>
                            )}
                            {confirmarEliminarModal && (
                              <div className="fixed inset-0 bg-black/10 flex justify-center items-center z-50">
                                <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-md">
                                  <h2 className="text-lg font-semibold mb-4">Confirmar Eliminación</h2>
                                  <p className="mb-4">¿Estás seguro que deseas eliminar la etiqueta de envío de este pedido?</p>
                                  
                                  <div className="flex justify-end gap-2">
                                    <button 
                                      onClick={() => setConfirmarEliminarModal(false)} 
                                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                    >
                                      Cancelar
                                    </button>
                                    <button 
                                      onClick={handleEliminarEtiqueta} 
                                      disabled={loading}
                                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                      {loading ? <Loading /> : 'Eliminar'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                            {showUploadModal && pedidoSeleccionado && (
                              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                                  <h2 className="text-lg font-bold mb-4">
                                    {pedidoSeleccionado.etiquetaEnvio ? 'Reemplazar etiqueta' : 'Subir etiqueta'}
                                  </h2>

                                  <div className="space-y-4">
                                    <label className="block">
                                      Número de tracking:
                                      <input 
                                        type="text" 
                                        value={etiqueta || pedidoSeleccionado.trackingCode || ''} 
                                        onChange={(e) => setEtiqueta(e.target.value)} 
                                        className="mt-1 w-full border rounded p-2"
                                        placeholder="Ingrese el número de tracking"
                                      />
                                    </label>

                                    <label className="block">
                                      Archivo (PDF, JPG, PNG):
                                      <input 
                                        type="file" 
                                        accept="application/pdf,image/jpeg,image/png" 
                                        onChange={(e) => setTrackingFile(e.target.files?.[0] || null)}
                                        className="mt-1 block w-full text-sm text-gray-500
                                          file:mr-4 file:py-2 file:px-4
                                          file:rounded-md file:border-0
                                          file:text-sm file:font-semibold
                                          file:bg-primary file:text-white
                                          hover:file:bg-primary-hover"
                                      />
                                      <p className="mt-1 text-xs text-gray-500">
                                        Formatos aceptados: PDF, JPG, PNG (máx. 5MB)
                                      </p>
                                    </label>

                                    {trackingFile && (
                                      <div className="p-2 border rounded bg-gray-50">
                                        <p className="text-sm font-medium">Archivo seleccionado:</p>
                                        <p className="text-sm">{trackingFile.name} ({(trackingFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex justify-end gap-2 mt-6">
                                    <button 
                                      onClick={() => {
                                        setShowUploadModal(false);
                                        setTrackingFile(null);
                                        setEtiqueta('');
                                      }} 
                                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                    >
                                      Cancelar
                                    </button>
                                    <button 
                                      onClick={() => handleUpload(pedidoSeleccionado)} 
                                      disabled={loading || (!trackingFile && !etiqueta)} 
                                      className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {loading ? <Loading /> : (pedidoSeleccionado.etiquetaEnvio ? 'ACTUALIZAR' : 'GUARDAR')}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                            {mostrarFacturaModal && pedidoSeleccionado && (                        
                              <div className="fixed inset-0 bg-black/5 flex justify-center items-center z-50">
                                <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-md">
                                  <h2 className="text-lg font-semibold mb-4">Datos para Factura</h2>
                                  <ul className="text-sm space-y-2">
                                    <li><strong>Razón Social:</strong> {pedidoSeleccionado.tipoFactura?.razonSocial}</li>
                                    <li><strong>CUIT:</strong> {pedidoSeleccionado.tipoFactura?.cuit}</li>
                                    <li><strong>Condición IVA:</strong> {pedidoSeleccionado.tipoFactura?.condicionIva}</li>
                                    <li><strong>Fecha:</strong> {new Date(pedidoSeleccionado.tipoFactura?.fecha).toLocaleDateString('es-AR')}</li>
                                  </ul>
                                  <button onClick={cerrarModalFactura} className="mt-4 bg-gray-300 hover:bg-gray-400 text-black px-4 py-1 rounded" >Cerrar</button>
                                </div>
                              </div>
                            )}
                            {mostrarEnvioModal && pedidoSeleccionado && (                          
                              <div className="fixed inset-0 bg-black/5 flex justify-center items-center z-50 p-2 rounded-md">
                                <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-md">
                                  <h2 className="text-lg font-semibold mb-4">Datos de Envío</h2>
                                  <ul className="text-sm grid grid-cols-2 gap-2 p-2">
                                    <li className='col-span-1'><strong>Email:</strong> {pedidoSeleccionado.usuarioInfo?.correo}</li><br/>
                                    <li><strong>Nombre:</strong> {pedidoSeleccionado.tipoFactura?.razonSocial}</li>
                                    <li><strong>DNI/CUIT:</strong> {pedidoSeleccionado.tipoFactura?.cuit}</li>
                                    <li><strong>Teléfono:</strong> {pedidoSeleccionado.direccionEnvio?.telefono}</li>
                                    <li><strong>País:</strong> {pedidoSeleccionado.direccionEnvio?.pais}</li>
                                    <li><strong>Provincia:</strong> {pedidoSeleccionado.direccionEnvio?. provincia}</li>
                                    <li><strong>Ciudad:</strong> {pedidoSeleccionado.direccionEnvio?.ciudad}</li>
                                    <li><strong>Calle:</strong> {pedidoSeleccionado.direccionEnvio?.calle}</li>
                                    <li><strong>Número:</strong> {pedidoSeleccionado.direccionEnvio?.numero}</li>
                                    <li><strong>Torre / Casa:</strong> {pedidoSeleccionado.direccionEnvio?.casaOTorre}</li>
                                    <li><strong>Piso:</strong> {pedidoSeleccionado.direccionEnvio?.piso}</li>
                                    <li><strong>Departamento:</strong> {pedidoSeleccionado.direccionEnvio?.depto}</li>
                                    <li><strong>Entre Calles:</strong> {pedidoSeleccionado.direccionEnvio?.entreCalles}</li>
                                    <li><strong>Código Postal:</strong> {pedidoSeleccionado.direccionEnvio?.codigoPostal}</li>
                                    <li><strong>Referencia:</strong> {pedidoSeleccionado.direccionEnvio?.referencia}</li>
                                  </ul>
                                  <button onClick={() => setMostrarEnvioModal(false)} className="mt-4 bg-gray-300 hover:bg-gray-400 text-black px-4 py-1 rounded"   >
                                    Cerrar
                                  </button>
                                </div>
                              </div>
                            )}
                        </div>

                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="mt-4 flex justify-center flex-row items-center gap-2">
            <button onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1} className="px-3 py-1 border rounded disabled:opacity-50">
              <FaBackward/>
            </button>
            <span>{paginaActual} de {totalPaginas}</span>
            <button onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas} className="px-3 py-1 border rounded disabled:opacity-50">
              <FaForward />
            </button>
          </div>
        </section>
  )
}

export default Todos