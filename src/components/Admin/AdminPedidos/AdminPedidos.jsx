// componentes/Admin/AdminPedidos/AdminPedidos.jsx
'use client';
import { useEffect, useMemo, useState } from "react";
import Loading from "../../Loading/Loading";
import EnTransito from "./EnTransito";
import Pagados from "./Pagados";
import Estadisticas from "./Estadisticas";
import Cancelados from "./Cancelados";
import Entregado from "./Entregado";
import Todos from "./Todos";
import cargarPedidos from "../../../Utils/cargarPedidos";
import actualizarEstado from "../../../Utils/actualizarEstado";
import userData from "../../constants/userData";

// 🔒 Constantes fuera del componente (evita deps inestables)
const PEDIDOS_POR_PAGINA = 25;
const ESTADOS = ["pendiente", "pagado", "enviado", "entregado", "cancelado"];
const TABS = {
  PEDIDOS: "PEDIDOS",
  PAGADOS: "PAGADOS",
  ESTADISTICAS: "ESTADISTICAS",
  TRANSITO: "TRANSITO",
  ENTREGADO: "ENTREGADO",
  ENVIAR: "ENVIAR",
  CANCELADOS: "CANCELADOS",
};

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actualizandoId, setActualizandoId] = useState([]);
  const [pedidosProcesando, setPedidosProcesando] = useState([]);
  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [paginaActual, setPaginaActual] = useState(1);
  const [tabActivo, setTabActivo] = useState(TABS.PEDIDOS);
  const [error, setError] = useState(null);

  // ⬇️ Traer pedidos sólo cuando tab = PEDIDOS
  useEffect(() => {
    let alive = true;
    const fetchData = async () => {
      try {
        await cargarPedidos(
          (data) => alive && setPedidos(data),
          (v) => alive && setLoading(v)
        );
      } catch (err) {
        if (alive) setError(err?.message || 'Error al cargar pedidos');
      }
    };
    if (tabActivo === TABS.PEDIDOS) fetchData();
    return () => { alive = false; };
  }, [tabActivo]); // ✅ ya no advierte por TABS

  // 🔧 Filtrado + búsqueda memorizados (evita recalcular en cada render)
  const pedidosFiltrados = useMemo(() => {
    const texto = search.trim().toLowerCase();
    return pedidos.filter((pedido) => {
      const coincideBusqueda =
        (pedido?.usuarioInfo?.nombreCompleto || '').toLowerCase().includes(texto) ||
        (pedido?._id || '').toLowerCase().includes(texto) ||
        (pedido?.usuarioInfo?.correo || '').toLowerCase().includes(texto);

      // En pestaña PEDIDOS con filtro "todos" excluimos cancelados (consistente con <Todos/>)
      const coincideEstado =
        filtroEstado === "todos"
          ? (tabActivo === TABS.PEDIDOS ? pedido.estado !== "cancelado" : true)
          : pedido.estado === filtroEstado;

      return coincideBusqueda && coincideEstado;
    });
  }, [pedidos, search, filtroEstado, tabActivo]);

  // 📄 Paginación memorizada
  const totalPaginas = useMemo(
    () => Math.ceil(pedidosFiltrados.length / PEDIDOS_POR_PAGINA) || 1,
    [pedidosFiltrados.length]
  );

  const pedidosPaginados = useMemo(() => {
    const start = (paginaActual - 1) * PEDIDOS_POR_PAGINA;
    return pedidosFiltrados.slice(start, start + PEDIDOS_POR_PAGINA);
  }, [pedidosFiltrados, paginaActual]);

  // ✅ Ajustar página si cambia la cantidad de páginas o la página actual queda fuera de rango
  useEffect(() => {
    if (paginaActual > totalPaginas) setPaginaActual(totalPaginas);
    if (paginaActual < 1) setPaginaActual(1);
  }, [totalPaginas, paginaActual]); // ✅ incluye paginaActual (warning resuelto)

  // ↩️ Resetear a página 1 al cambiar búsqueda o filtro
  useEffect(() => {
    setPaginaActual(1);
  }, [search, filtroEstado]);

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) setPaginaActual(nuevaPagina);
  };

  const handleStados = (id, nuevoEstado) => {
    actualizarEstado(id, nuevoEstado, setActualizandoId, setPedidos, false, userData);
  };

  if (process.env.NODE_ENV !== "production") {
    console.debug('[AdminPedidos] pedidos total:', pedidos.length);
    console.debug('[AdminPedidos] pedidosFiltrados length:', pedidosFiltrados.length);
    console.debug('[AdminPedidos] pedidosPaginados length:', pedidosPaginados.length);
    console.debug('[AdminPedidos] paginaActual / totalPaginas:', paginaActual, '/', totalPaginas);
  }

  if (loading && tabActivo === TABS.PEDIDOS) {
    return <div className="p-4"><Loading /></div>;
  }

  return (
    <div className="p-0 md:p-4">
      <h1 className="text-2xl font-bold mb-4 uppercase">Administración de Pedidos</h1>

      {/* Tabs */}
      <div className="flex flex-col md:flex-row border-b mb-6">
        <button className={`px-4 py-2 font-medium ${tabActivo === TABS.PEDIDOS ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`} onClick={() => setTabActivo(TABS.PEDIDOS)}>TODOS</button>
        <button className={`px-4 py-2 font-medium ${tabActivo === TABS.PAGADOS ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`} onClick={() => setTabActivo(TABS.PAGADOS)}>PAGADOS</button>
        <button className={`px-4 py-2 font-medium ${tabActivo === TABS.TRANSITO ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`} onClick={() => setTabActivo(TABS.TRANSITO)}>EN TRANSITO</button>
        <button className={`px-4 py-2 font-medium ${tabActivo === TABS.ENTREGADO ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`} onClick={() => setTabActivo(TABS.ENTREGADO)}>ENTREGADO</button>
        <button className={`px-4 py-2 font-medium ${tabActivo === TABS.ESTADISTICAS ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`} onClick={() => setTabActivo(TABS.ESTADISTICAS)}>ESTADISTICAS</button>
        <button className={`px-4 py-2 font-medium ${tabActivo === TABS.CANCELADOS ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`} onClick={() => setTabActivo(TABS.CANCELADOS)}>CANCELADOS</button>
      </div>

      {/* Contenido por tab */}
      {tabActivo === TABS.PEDIDOS && (
        <Todos
          search={search}
          filtroEstado={filtroEstado}
          setSearch={setSearch}
          setFiltroEstado={setFiltroEstado}
          cambiarPagina={cambiarPagina}
          estados={ESTADOS}
          pedidosPaginados={pedidosPaginados}
          actualizandoId={actualizandoId}
          setActualizandoId={setActualizandoId}
          setPedidosProcesando={setPedidosProcesando}
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          handleStados={handleStados}
        />
      )}
      {tabActivo === TABS.PAGADOS && <Pagados />}
      {tabActivo === TABS.TRANSITO && <EnTransito />}
      {tabActivo === TABS.ENTREGADO && <Entregado />}
      {tabActivo === TABS.CANCELADOS && <Cancelados />}
      {tabActivo === TABS.ESTADISTICAS && <Estadisticas />}
    </div>
  );
}
