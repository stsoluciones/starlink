import React from 'react'
import Loading from '../../Loading/Loading';
import Link from 'next/link';

const Todos = ({search, filtroEstado, setSearch, setFiltroEstado, estados, pedidosPaginados, actualizandoId, paginaActual, totalPaginas, handleStados, cambiarPagina }) => {
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
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="hidden md:flex px-4 py-2 whitespace-nowrap">ID</th>
                  <th className="px-4 py-2 whitespace-nowrap">Fecha</th>
                  <th className="px-4 py-2 whitespace-nowrap">Cliente</th>
                  <th className="hidden md:flex px-4 py-2 whitespace-nowrap">Correo</th>
                  <th className="px-4 py-2 whitespace-nowrap">Transfer</th>
                  <th className="md:flex-col px-4 py-2 whitespace-nowrap">Total</th>
                  <th className="hidden md:flex px-4 py-2 whitespace-nowrap">Cambiar Estado</th>
                </tr>
              </thead>
              <tbody>
                {pedidosPaginados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-gray-600 py-4">
                      No hay pedidos disponibles.
                    </td>
                  </tr>
                ) : (
                pedidosPaginados.map((pedido) => (
                  <tr key={pedido._id} className="border-t">
                    <td className="hidden md:flex px-4 py-2">{pedido._id}</td>
                    <td className="px-4 py-2">{new Date(pedido.fechaPedido).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{pedido.usuarioInfo?.nombreCompleto || "Sin nombre"}</td>
                    <td className="hidden md:flex px-4 py-2">{pedido.usuarioInfo?.correo || "-"}</td>
                    <td className="px-4 py-2 font-semibold">{pedido?.metadata?.ticketUrl ?<Link href={pedido?.metadata?.ticketUrl} target='_blank'>Ver</Link>:null}</td>
                    <td className="md:flex-col px-4 py-2">{new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", }).format(pedido.total)}</td>
                    <td className="hidden md:flex px-4 py-2">
                      <select disabled={actualizandoId === pedido._id} className="border rounded px-2 py-1 w-full sm:w-auto" value={pedido.estado} onChange={(e) => handleStados(pedido._id, e.target.value)}>
                        {estados.map((estado) => (
                          <option key={estado} value={estado}>{estado}</option>
                        ))}
                      </select>
                      {actualizandoId === pedido._id && (
                        <>
                          <span className="ml-2 text-xs text-gray-500">Guardando</span><Loading />
                        </>
                      )}
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