// componentes/Admin/AdminPedidos/AdminPedidos.jsx
import { useEffect, useState } from "react";
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

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actualizandoId, setActualizandoId] = useState([]);
  const [pedidosProcesando, setPedidosProcesando] =useState([])
  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [paginaActual, setPaginaActual] = useState(1);
  const [tabActivo, setTabActivo] = useState("pedidos"); // Estado para controlar la pestaña activa
  const [error, setError] = useState(null);
  const pedidosPorPagina = 25;
  const estados = ["pendiente", "pagado", "enviado", "entregado", "cancelado"];

  // Tabs disponibles
  const TABS = {
    PEDIDOS: "pedidos",
    PAGADOS: "PAGADOS",
    ESTADISTICAS: "ESTADISTICAS",
    TRANSITO: "TRANSITO",
    ENTREGADO: "ENTREGADO",
    ENVIAR: "ENVIAR",
    CANCELADOS: "CANCELADOS"
  };

    useEffect(() => {
    const fetchData = async () => {
      try {
        await cargarPedidos(setPedidos, setLoading);
      } catch (err) {
        setError(err.message);
      }
    };
    if (tabActivo === TABS.PEDIDOS) {
    
    fetchData();
    }

  }, [tabActivo]);

const handleStados = (id, nuevoEstado) => {
  actualizarEstado(id, nuevoEstado, setActualizandoId, setPedidos,false,userData);
};

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const texto = search.toLowerCase();
    const coincideBusqueda =
      pedido.usuarioInfo?.nombreCompleto?.toLowerCase().includes(texto) ||
      pedido?._id?.toLowerCase().includes(texto) ||
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

  if (loading && tabActivo === TABS.PEDIDOS) return <div className="p-4"><Loading /></div>;

  return (
    <div className="p-0 md:p-4">
      <h1 className="text-2xl font-bold mb-4 uppercase">Administración de Pedidos</h1>
      
      {/* Navegación por tabs */}
      <div className="flex flex-col md:flex-row  border-b mb-6">
        <button className={`px-4 py-2 font-medium ${tabActivo === TABS.PEDIDOS ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`} onClick={() => setTabActivo(TABS.PEDIDOS)}>TODOS</button>
        <button className={`px-4 py-2 font-medium ${tabActivo === TABS.PAGADOS ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`} onClick={() => setTabActivo(TABS.PAGADOS)}>PAGADOS</button>
        <button className={`px-4 py-2 font-medium ${tabActivo === TABS.TRANSITO ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`} onClick={() => setTabActivo(TABS.TRANSITO)}>EN TRANSITO</button>
        <button className={`px-4 py-2 font-medium ${tabActivo === TABS.ENTREGADO ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`} onClick={() => setTabActivo(TABS.ENTREGADO)}>ENTREGADO</button>
        <button className={`px-4 py-2 font-medium ${tabActivo === TABS.ESTADISTICAS ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`} onClick={() => setTabActivo(TABS.ESTADISTICAS)}>ESTADISTICAS</button>
        <button className={`px-4 py-2 font-medium ${tabActivo === TABS.CANCELADOS ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`} onClick={() => setTabActivo(TABS.CANCELADOS)}>CANCELADOS</button>
      </div>

      {/* Contenido de los tabs */}
      {tabActivo === TABS.PEDIDOS && (
        <Todos search={search} filtroEstado={filtroEstado} setSearch={setSearch} setFiltroEstado={setFiltroEstado} cambiarPagina={cambiarPagina} estados={estados} pedidosPaginados={pedidosPaginados} actualizandoId={actualizandoId} setActualizandoId={setActualizandoId} setPedidosProcesando={setPedidosProcesando} paginaActual={paginaActual} totalPaginas={totalPaginas} handleStados={handleStados} />
      )}
      {tabActivo === TABS.PAGADOS && (
        <Pagados />
      )}
      {tabActivo === TABS.TRANSITO && (
        <EnTransito />
      )}
      {tabActivo === TABS.ENTREGADO && (
        <Entregado />
      )}
      {tabActivo === TABS.CANCELADOS && (
        <Cancelados />
      )}
      {tabActivo === TABS.ESTADISTICAS && (
        <Estadisticas />
      )}
    </div>
  );
}