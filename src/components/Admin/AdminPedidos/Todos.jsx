import React, { useState } from 'react'
import Loading from '../../Loading/Loading';

const Todos = ({search, filtroEstado, setSearch, setFiltroEstado, estados, pedidosPaginados, actualizandoId, paginaActual, totalPaginas, handleStados, cambiarPagina }) => {
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [mostrarFacturaModal, setMostrarFacturaModal] = useState(false);

  const abrirModalFactura = (pedido) => {
    setPedidoSeleccionado(pedido);
    setMostrarFacturaModal(true);
  };

  const cerrarModalFactura = () => {
    setMostrarFacturaModal(false);
    setPedidoSeleccionado(null);
  };

  if (!pedidosPaginados) return <div className="p-4"><Loading /></div>;
  if (pedidosPaginados.length === 0) { 
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold">No hay pedidos disponibles</h2>
        <p className="text-gray-600">Intenta ajustar los filtros o buscar por otro término.</p>
      </div>
    );
  }
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
                pedidosPaginados.map((pedido) => (
                  console.log('pedido:',pedido),
                  <tr key={pedido._id} className="border-t">
                    <td colSpan={8} className="p-4">
                      <div className="border rounded-lg shadow-sm p-4 space-y-4">

                        {/* Encabezado: Estado, Fecha y Botón de etiqueta */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <p className="text-xs text-gray-500 my-2">{new Date(pedido.fechaPedido).toLocaleString('es-AR')}</p>
                            {pedido.estado !== 'pendiente' && pedido.estado !== 'cancelado' && (
                              <button onClick={() => handleGenerarAndreani(pedido.direccionEnvio)} className="text-white font-semibold bg-orange-500 hover:bg-orange-600 p-2 my-2 rounded-md" >
                                {pedido.estado === 'pagado' ? 'Imprimir etiqueta' : 'Reimprimir etiqueta'}
                              </button>
                            )}
                            {/* Botón imprimir etiqueta */}
                            {pedido.metadata?.ticketUrl && pedido.paymentMethod === 'transferencia' && (
                              <a href={pedido.metadata.ticketUrl} target="_blank" rel="noopener noreferrer" className={`bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded`}> ver ticket</a> )}
                          </div>

                          {/* Selector de estado */}
                          <div className="flex flex-col md:flex-row md:items-center gap-2">
                            <select
                              disabled={actualizandoId === pedido._id}
                              className="border rounded px-2 py-1 w-full md:w-auto"
                              value={pedido.estado}
                              onChange={(e) => handleStados(pedido._id, e.target.value)}
                            >
                              {estados.map((estado) => (
                                <option key={estado} value={estado}>{estado}</option>
                              ))}
                            </select>
                            {actualizandoId === pedido._id && (
                              <span className="ml-2 text-xs text-gray-500 inline-flex items-center">
                                Guardando <Loading />
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Lista de productos */}
                        <div className="flex flex-wrap gap-4">
                          {pedido.metadata?.cart?.map((item, index) => (
                            <div key={index} className="flex items-center border rounded p-2 w-full md:w-auto md:min-w-[250px]">
                              <img
                                src={item.foto_1_1}
                                alt={item.nombre}
                                className="w-16 h-16 object-contain mr-4"
                              />
                              <div>
                                <p className="text-sm font-semibold">{item.titulo_de_producto}</p>
                                <p className="text-xs text-gray-600">
                                  Cantidad: <span className="text-blue-600 font-bold">{item.quantity}</span>
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Datos del comprador */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-2 border-t mt-4">
                          <p className="text-sm text-gray-700">{pedido.usuarioInfo?.nombreCompleto || "Sin nombre"}</p>
                          <a href={`mailto:${pedido.usuarioInfo?.correo}`} className="text-blue-600 hover:underline text-sm" >Iniciar conversación</a>
                          <button onClick={() => abrirModalFactura(pedido)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded ml-2">
                            Ver datos de Factura
                          </button>
                          {mostrarFacturaModal && pedidoSeleccionado && (
                              <div className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-50">
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
                                  <button onClick={cerrarModalFactura} className="mt-4 bg-gray-300 hover:bg-gray-400 text-black px-4 py-1 rounded" >
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
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
            <button onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1} className="px-3 py-1 border rounded disabled:opacity-50">
              Anterior
            </button>
            <span>Página {paginaActual} de {totalPaginas}</span>
            <button onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas} className="px-3 py-1 border rounded disabled:opacity-50">
              Siguiente
            </button>
          </div>
        </section>
  )
}

export default Todos