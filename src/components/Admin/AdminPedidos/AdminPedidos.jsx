// componentes/Admin/AdminPedidos/AdminPedidos.jsx
import { useEffect, useState } from "react";
import Loading from "../../Loading/Loading";
import ParaEnviar from "./ParaEnviar";
import Todos from "./Todos";
import cargarPedidos from "../../../Utils/cargarPedidos";
import actualizarEstado from "../../../Utils/actualizarEstado";

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actualizandoId, setActualizandoId] = useState(null);
  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [paginaActual, setPaginaActual] = useState(1);
  const [tabActivo, setTabActivo] = useState("pedidos"); // Estado para controlar la pestaña activa
  const [error, setError] = useState(null);
  const pedidosPorPagina = 5;
  const estados = ["pendiente", "pagado", "procesando", "enviado", "entregado", "cancelado"];

  // Tabs disponibles
  const TABS = {
    PEDIDOS: "pedidos",
    CONFIGURACION: "configuracion",
    REPORTES: "reportes",
    ENVIAR: "ENVIAR"
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
  actualizarEstado(id, nuevoEstado, setActualizandoId, setPedidos);
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

  if (loading && tabActivo === TABS.PEDIDOS) return <div className="p-4"><Loading /></div>;

  return (
    <div className="p-0 md:p-4">
      <h1 className="text-2xl font-bold mb-4 uppercase">Administración de Pedidos</h1>
      
      {/* Navegación por tabs */}
      <div className="flex border-b mb-6">
        <button className={`px-4 py-2 font-medium ${tabActivo === TABS.PEDIDOS ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`} onClick={() => setTabActivo(TABS.PEDIDOS)}>TODOS</button>
        <button className={`px-4 py-2 font-medium ${tabActivo === TABS.ENVIAR ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`} onClick={() => setTabActivo(TABS.ENVIAR)}>ENVIAR</button>
        <button className={`px-4 py-2 font-medium ${tabActivo === TABS.REPORTES ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`} onClick={() => setTabActivo(TABS.REPORTES)}>Reportes</button>
        <button className={`px-4 py-2 font-medium ${tabActivo === TABS.CONFIGURACION ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`} onClick={() => setTabActivo(TABS.CONFIGURACION)}>Configuración</button>
      </div>

      {/* Contenido de los tabs */}
      {tabActivo === TABS.PEDIDOS && (
        <Todos search={search} filtroEstado={filtroEstado} setSearch={setSearch} setFiltroEstado={setFiltroEstado} cambiarPagina={cambiarPagina} estados={estados} pedidosPaginados={pedidosPaginados} actualizandoId={actualizandoId} paginaActual={paginaActual} totalPaginas={totalPaginas} handleStados={handleStados} />
      )}

      {tabActivo === TABS.ENVIAR && (
        <ParaEnviar />
      )}

      {tabActivo === TABS.REPORTES && (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-4">Reportes y Estadísticas</h2>
          <p className="text-gray-600">Aquí encontrarás reportes de ventas y estadísticas (en desarrollo)</p>
        </div>
      )}

      {tabActivo === TABS.CONFIGURACION && (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-4">Configuración del Sistema</h2>
          <p className="text-gray-600">Configura los parámetros de tu tienda (en desarrollo)</p>
        </div>
      )}
    </div>
  );
}