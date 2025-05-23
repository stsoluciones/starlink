import { useEffect, useState } from "react";

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actualizandoId, setActualizandoId] = useState(null);
  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [paginaActual, setPaginaActual] = useState(1);

  const pedidosPorPagina = 5;
  const estados = ["pendiente", "pagado", "procesando", "enviado", "entregado", "cancelado"];

  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        const res = await fetch("/api/obtener-pedidos");
        const data = await res.json();
        console.log('data pedidos:', data);
        
        if (!Array.isArray(data)) {
          if (Array.isArray(data.pedidos)) {
            const ordenados = data.pedidos.sort(
              (a, b) => new Date(b.fechaPedido) - new Date(a.fechaPedido)
            );
            setPedidos(ordenados);
          } else {
            throw new Error("Respuesta inesperada del servidor.");
          }
        } else {
          const ordenados = data.sort((a, b) => new Date(b.fechaPedido) - new Date(a.fechaPedido));
          setPedidos(ordenados);
        }
      } catch (err) {
        console.error("Error al obtener pedidos:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarPedidos();
  }, []);

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      setActualizandoId(id);
      const res = await fetch(`/api/actualizar-pedido/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nuevoEstado }),
      });
      const data = await res.json();
      if (data.success) {
        setPedidos((prev) =>
          prev.map((p) => (p._id === id ? data.pedido : p))
        );
      } else {
        alert("Error al actualizar estado");
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setActualizandoId(null);
    }
  };

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const texto = search.toLowerCase();
    const coincideBusqueda =
      pedido.usuarioInfo?.nombreCompleto?.toLowerCase().includes(texto) ||
      pedido.usuarioInfo?.correo?.toLowerCase().includes(texto);
    const coincideEstado = filtroEstado === "todos" || pedido.estado === filtroEstado;
    return coincideBusqueda && coincideEstado;
  });

  const totalPaginas = Math.ceil(pedidosFiltrados.length / pedidosPorPagina);
  const pedidosPaginados = pedidosFiltrados.slice(
    (paginaActual - 1) * pedidosPorPagina,
    paginaActual * pedidosPorPagina
  );

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  if (loading) return <div className="p-4">Cargando pedidos...</div>;

 return (
        <div className="p-0 md:p-4">
          <h1 className="text-2xl font-bold mb-4 uppercase">Administrar Pedidos</h1>

          {/* Filtros */}
          <div className="mb-4 flex flex-col sm:flex-row flex-wrap gap-4">
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPaginaActual(1);
              }}
              className="border px-3 py-2 rounded w-full sm:w-60"
            />

            <select
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value);
                setPaginaActual(1);
              }}
              className="border px-3 py-2 rounded w-full sm:w-auto"
            >
              <option value="todos">Todos los estados</option>
              {estados.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="hidden md:flex px-4 py-2 whitespace-nowrap">ID</th>
                  <th className="px-4 py-2 whitespace-nowrap">Fecha</th>
                  <th className="px-4 py-2 whitespace-nowrap">Cliente</th>
                  <th className="hidden md:flex px-4 py-2 whitespace-nowrap">Correo</th>
                  <th className="px-4 py-2 whitespace-nowrap">Estado</th>
                  <th className="hidden md:flex px-4 py-2 whitespace-nowrap">Total</th>
                  <th className="px-4 py-2 whitespace-nowrap">Cambiar Estado</th>
                </tr>
              </thead>
              <tbody>
                {pedidosPaginados.map((pedido) => (
                  <tr key={pedido._id} className="border-t">
                    <td className="hidden md:flex px-4 py-2 break-all">{pedido._id}</td>
                    <td className="px-4 py-2">{new Date(pedido.fechaPedido).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{pedido.usuarioInfo?.nombreCompleto || "Sin nombre"}</td>
                    <td className="hidden md:flex px-4 py-2">{pedido.usuarioInfo?.correo || "-"}</td>
                    <td className="px-4 py-2 font-semibold">{pedido.estado}</td>
                    <td className="hidden md:flex px-4 py-2">${pedido.total.toFixed(2)}</td>
                    <td className="px-4 py-2">
                      <select
                        disabled={actualizandoId === pedido._id}
                        className="border rounded px-2 py-1 w-full sm:w-auto"
                        value={pedido.estado}
                        onChange={(e) => actualizarEstado(pedido._id, e.target.value)}
                      >
                        {estados.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </select>
                      {actualizandoId === pedido._id && (
                        <span className="ml-2 text-xs text-gray-500">Guardando...</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
            <button
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Anterior
            </button>
            <span>
              Página {paginaActual} de {totalPaginas}
            </span>
            <button
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      );

}
