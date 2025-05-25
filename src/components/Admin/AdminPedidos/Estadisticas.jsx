//componentes/Admin/AdminPedidos/Estadisticas.jsx
import { useEffect, useState } from "react";
import Loading from "../../Loading/Loading";

const Estadisticas = () => {
  // Datos de ejemplo - en una implementación real estos vendrían de una API
  const [estadisticas, setEstadisticas] = useState({
    ventasTotales: 0,
    pedidosPorEstado: {},
    productosMasVendidos: [],
    tendenciaMensual: [],
    totalClientes: 0,
    clientesConPedidos: 0,
    ticketPromedio: 0,
    carritosAbandonados: 0,
    loading: true
  });

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        setEstadisticas(prev => ({...prev, loading: true}));
        
        const response = await fetch('/api/Estadisticas');
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        setEstadisticas({
          ...data,
          loading: false
        });
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
        setEstadisticas(prev => ({
          ...prev,
          loading: false
        }));
      }
    };

    cargarEstadisticas();
  }, []);

  if (estadisticas.loading) {
    return <div className="p-4"><Loading /></div>;
  }

  return (
    <div className="bg-gray-50 p-4 md:p-8 rounded-lg">
      <h2 className="text-xl font-semibold mb-6 text-center">Estadísticas del Sistema</h2>
      
      {/* Resumen rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium text-gray-500">Clientes Registrados</h3>
            <p className="text-2xl font-bold">{estadisticas.totalClientes}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium text-gray-500">Clientes Activos</h3>
            <p className="text-2xl font-bold">{estadisticas.clientesConPedidos}</p>
            <p className="text-sm text-gray-500 mt-1">
            {((estadisticas.clientesConPedidos / estadisticas.totalClientes) * 100 || 0).toFixed(1)}% conversión
            </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium text-gray-500">Ventas Totales</h3>
          <p className="text-2xl font-bold">${estadisticas.ventasTotales.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium text-gray-500">Ticket Promedio</h3>
          <p className="text-2xl font-bold">${estadisticas.ticketPromedio.toFixed(2)}</p>
        </div>
      </div>

      {/* Gráficos y estadísticas detalladas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado de pedidos */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium mb-3">Distribución de Pedidos</h3>
          <div className="space-y-2">
            {Object.entries(estadisticas.pedidosPorEstado).map(([estado, cantidad]) => (
              <div key={estado} className="flex items-center">
                <span className="w-24 capitalize">{estado}:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-blue-500 h-4 rounded-full" 
                    style={{ width: `${(cantidad / Object.values(estadisticas.pedidosPorEstado).reduce((a, b) => a + b, 0)) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2 w-8 text-right">{cantidad}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Productos más vendidos */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium mb-3">Productos Más Vendidos</h3>
          <ul className="space-y-3">
            {estadisticas.productosMasVendidos.map((producto, index) => (
              <li key={index} className="flex justify-between">
                <span className="truncate">{producto.nombre}</span>
                <span className="font-medium">{producto.ventas} ventas</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tendencia mensual */}
        <div className="bg-white p-4 rounded-lg shadow lg:col-span-2">
          <h3 className="font-medium mb-3">Tendencia de Ventas Mensuales</h3>
          <div className="flex items-end h-48 gap-2 pt-4">
            {estadisticas.tendenciaMensual.map((mes, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-all"
                  style={{ height: `${(mes.ventas / Math.max(...estadisticas.tendenciaMensual.map(m => m.ventas))) * 80}%` }}
                  title={`$${mes.ventas.toLocaleString()}`}
                ></div>
                <span className="text-sm mt-1">{mes.mes}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Carritos abandonados */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium mb-3">Carritos Abandonados</h3>
          <p className="text-3xl font-bold text-red-500">{estadisticas.carritosAbandonados}</p>
          <p className="text-sm text-gray-500 mt-2">Últimos 30 días</p>
        </div>

        {/* Conversión */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium mb-3">Tasa de Conversión</h3>
          <p className="text-3xl font-bold text-green-500">
            {((Object.values(estadisticas.pedidosPorEstado).reduce((a, b) => a + b, 0) / 
              (Object.values(estadisticas.pedidosPorEstado).reduce((a, b) => a + b, 0) + estadisticas.carritosAbandonados) * 100).toFixed(1))}%
          </p>
          <p className="text-sm text-gray-500 mt-2">Pedidos completados vs abandonados</p>
        </div>
      </div>
    </div>
  );
};

export default Estadisticas;