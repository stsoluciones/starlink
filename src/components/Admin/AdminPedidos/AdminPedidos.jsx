import { useEffect, useState } from "react";
import Loading from "../../Loading/Loading";
import Swal from 'sweetalert2';
import ParaEnviar from "./ParaEnviar";
import Todos from "./Todos";

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actualizandoId, setActualizandoId] = useState(null);
  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [paginaActual, setPaginaActual] = useState(1);
  const [tabActivo, setTabActivo] = useState("pedidos"); // Estado para controlar la pestaña activa

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
    const cargarPedidos = async () => {
      try {
        const res = await fetch("/api/obtener-pedidos");
        const data = await res.json();

        const pedidosData = Array.isArray(data) ? data : data.pedidos;
        if (!Array.isArray(pedidosData)) {
          throw new Error("Respuesta inesperada del servidor.");
        }

        const ordenados = pedidosData.sort(
          (a, b) => new Date(b.fechaPedido) - new Date(a.fechaPedido)
        );
        setPedidos(ordenados);

        await fetch("/api/verificar-pedidos", { method: "POST" });
      } catch (err) {
        console.error("Error al obtener pedidos:", err);
      } finally {
        setLoading(false);
      }
    };

    if (tabActivo === TABS.PEDIDOS) {
      cargarPedidos();
    }
  }, [tabActivo]);

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: `Vas a cambiar el estado del pedido a "${nuevoEstado}"`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cambiar estado',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
      });

      if (!result.isConfirmed) return;

      setActualizandoId(id);
      
      const res = await fetch(`/api/actualizar-pedido/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nuevoEstado }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        await Swal.fire({
          title: '¡Actualizado!',
          text: `El estado del pedido ha sido cambiado a "${nuevoEstado}"`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        
        setPedidos((prev) =>
          prev.map((p) => (p._id === id ? data.pedido : p))
        );
      } else {
        await Swal.fire({
          title: 'Error',
          text: data.message || 'Error al actualizar estado',
          icon: 'error'
        });
      }
    } catch (err) {
      console.error("Error:", err);
      await Swal.fire({
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor',
        icon: 'error'
      });
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
        <Todos search={search} filtroEstado={filtroEstado} setSearch={setSearch} setFiltroEstado={setFiltroEstado} setPaginaActual={setPaginaActual} estados={estados} pedidosPaginados={pedidosPaginados} actualizandoId={actualizandoId} paginaActual={paginaActual} totalPaginas={totalPaginas} actualizarEstado={actualizarEstado} />
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