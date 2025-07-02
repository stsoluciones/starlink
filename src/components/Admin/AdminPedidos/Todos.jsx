import React, { useEffect, useState } from 'react'
import { FaBackward, FaForward } from 'react-icons/fa';
import Swal from 'sweetalert2';
import Loading from '../../Loading/Loading';
import handleGenerarAndreani from '../../../Utils/handleGenerarAndreani'
import actualizarEstado from '../../../Utils/actualizarEstado';
import Link from 'next/link';


const Todos = ({search, filtroEstado, setSearch, setFiltroEstado, estados, pedidosPaginados, actualizandoId, setActualizandoId, paginaActual, totalPaginas, handleStados, cambiarPagina, setPedidosProcesando }) => {
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [mostrarFacturaModal, setMostrarFacturaModal] = useState(false);
  const [seleccionados, setSeleccionados] = useState([]);
  const [todosSeleccionados, setTodosSeleccionados] = useState(false);
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
  console.log('Generando etiquetas para pedidos:', pedidoUnico);
  console.log('Pedidos paginados:', pedidosPaginados)
  console.log('Seleccionados:', seleccionados);
  
  
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
      Swal.fire("Atención", "No hay pedidos seleccionados para generar etiquetas.", "info");
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
      const result = await Swal.fire({
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
        Swal.fire('Operación Cancelada', 'No se actualizaron los pedidos.', 'info');
        return;
      }

      // Mostrar cargando mientras se generan etiquetas
      Swal.fire({
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
      Swal.close();
      Swal.fire('¡Pedidos actualizados!', 'Todos los pedidos fueron marcados como enviados.', 'success');


      const resultados = await Promise.all(
        pedidosAActualizar.map(pedido =>
          actualizarEstado(
            pedido._id,
            "enviado",
            setActualizandoId,
            setPedidosProcesando,
            true
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

      Swal.fire({
        title: '¡Éxito!',
        text: `Se actualizaron ${actualizadosConExito} pedido(s) a "enviado".`,
        icon: 'success'
      });

      setSeleccionados([]);
      setTodosSeleccionados(false);

    } catch (error) {
      console.error("Error al generar etiquetas y actualizar pedidos:", error);
      Swal.fire({
        title: 'Error General',
        text: error.message || "Ocurrió un error inesperado durante el proceso.",
        icon: 'error'
      });
    }
  };

  return (
          <section>
          {/* Filtros */}
          <div className="mb-4 flex flex-col sm:flex-row flex-wrap gap-4">
            <input type="text" placeholder="Buscar por nombre o correo..." value={search} onChange={(e) => {setSearch(e.target.value); cambiarPagina(1);;}} className="border px-3 py-2 rounded w-full sm:w-60" />
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
            <table className="min-w-full border border-gray-300 text-sm">
              <tbody>
                {pedidosPaginados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-gray-600 py-4">
                      No hay pedidos disponibles.
                    </td>
                  </tr>
                ) : (
                pedidosPaginados
                .slice()
                .sort((a, b) => new Date(b.fechaPedido) - new Date(a.fechaPedido))
                .map((pedido) => (
                  <tr key={pedido._id} className="border-t">
                    <td colSpan={8} className="p-4">
                      <div className="border rounded-lg shadow-sm p-4 space-y-4">

                        {/* Encabezado: Estado, Fecha y Botón de etiqueta */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <p className="text-xs text-gray-500 p-2 my-2">{new Date(pedido.fechaPedido).toLocaleString('es-AR')}</p>
                          <div className=' flex gap-2 align-middle'>
                            {pedido.estado !== 'pendiente' && pedido.estado !== 'cancelado' && (
                              <button onClick={() => generarEtiquetas(pedido)} className="text-white font-semibold bg-orange-500 hover:bg-orange-600 p-2 my-2 rounded-md" >{pedido.estado === 'pagado' ? 'Imprimir etiqueta' : 'Reimprimir etiqueta'}</button>)}
                            {/* Botón imprimir etiqueta */}
                            {pedido.metadata?.ticketUrl && pedido.paymentMethod === 'transferencia' && (
                              <a href={pedido.metadata.ticketUrl} target="_blank" rel="noopener noreferrer" className={`bg-blue-600 hover:bg-blue-700 text-white text-sm p-2 my-2 rounded`}> ver ticket</a> )}
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
                              <img src={item.foto_1_1 || '/images/sinFoto.webp'} alt={item.nombre} title={item.nombre} className="w-16 h-16 object-contain mr-4" />
                              <div>
                                <p className="text-sm font-semibold">{item.titulo_de_producto}</p>
                                <p className="text-xs text-gray-600">
                                  Cantidad: <span className="text-red-500 font-bold text-xl">{item.quantity}</span>
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Datos del comprador */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-2 border-t mt-4">
                          <p className="text-sm text-gray-700">{pedido.usuarioInfo?.nombreCompleto || "Sin nombre"}</p>
                          <Link href={`mailto:${pedido.usuarioInfo?.correo}`} className="text-blue-600 hover:underline text-sm" >Enviar Correo</Link>
                          {pedido.usuarioInfo?.telefono?<Link href={`https://wa.me/+54${pedido.usuarioInfo?.telefono}`} className="text-blue-600 hover:underline text-sm" target='_blank' >WhatsApp</Link>:null}
                          <button onClick={() => abrirModalFactura(pedido)} className="bg-primary hover:bg-primary text-white text-sm px-3 py-1 rounded ml-2">
                            Ver datos de Factura
                          </button>
                          <button onClick={() => { setPedidoSeleccionado(pedido);setMostrarEnvioModal(true) }}  className="bg-primary hover:bg-primary text-white text-sm px-3 py-1 rounded ml-2">
                            Ver datos de Envío
                          </button>
                          {mostrarFacturaModal && pedidoSeleccionado && (                        
                              <div className="fixed inset-0 bg-gray-500/10 flex justify-center items-center z-50">
                                <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-md">
                                  <h2 className="text-lg font-semibold mb-4">Datos para Factura</h2>
                                  <ul className="text-sm space-y-2">
                                    <li><strong>Tipo:</strong> {pedidoSeleccionado.tipoFactura?.tipo}</li>
                                    <li><strong>Razón Social:</strong> {pedidoSeleccionado.tipoFactura?.razonSocial}</li>
                                    <li><strong>CUIT:</strong> {pedidoSeleccionado.tipoFactura?.cuit}</li>
                                    <li><strong>Condición IVA:</strong> {pedidoSeleccionado.tipoFactura?.condicionIva}</li>
                                    <li><strong>Domicilio:</strong> {pedidoSeleccionado.tipoFactura?.domicilio}</li>
                                    <li><strong>Código Postal:</strong> {pedidoSeleccionado.tipoFactura?.codigoPostal}</li>
                                    <li><strong>Fecha:</strong> {new Date(pedidoSeleccionado.tipoFactura?.fecha).toLocaleDateString('es-AR')}</li>
                                  </ul>
                                  <button onClick={cerrarModalFactura} className="mt-4 bg-gray-300 hover:bg-gray-400 text-black px-4 py-1 rounded" >Cerrar</button>
                                </div>
                              </div>
                            )}
                            {mostrarEnvioModal && pedidoSeleccionado && (
                              <div className="fixed inset-0 bg-gray-500/10 flex justify-center items-center z-50">
                                <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-md">
                                  <h2 className="text-lg font-semibold mb-4">Datos de Envío</h2>
                                  <ul className="text-sm space-y-2">
                                    <li><strong>Teléfono:</strong> {pedidoSeleccionado.direccionEnvio?.telefono}</li>
                                    <li><strong>Email:</strong> {pedidoSeleccionado.usuarioInfo?.correo}</li>
                                    <li><strong>País:</strong> {pedidoSeleccionado.direccionEnvio?.pais}</li>
                                    <li><strong>Provincia:</strong> {pedidoSeleccionado.direccionEnvio?. provincia}</li>
                                    <li><strong>Ciudad:</strong> {pedidoSeleccionado.direccionEnvio?.ciudad}</li>
                                    <li><strong>Calle:</strong> {pedidoSeleccionado.direccionEnvio?.calle}</li>
                                    <li><strong>Número:</strong> {pedidoSeleccionado.direccionEnvio?.numero}</li>
                                    <li><strong>Torre / Casa:</strong> {pedidoSeleccionado.direccionEnvio?.casaOTorre}</li>
                                    <li><strong>Departamento:</strong> {pedidoSeleccionado.direccionEnvio?.depto}</li>
                                    <li><strong>Código Postal:</strong> {pedidoSeleccionado.direccionEnvio?.codigoPostal}</li>
                                    <li><strong>Entre Calles:</strong> {pedidoSeleccionado.direccionEnvio?.entreCalles}</li>
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