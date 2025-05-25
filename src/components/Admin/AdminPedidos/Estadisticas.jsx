//componentes/Admin/AdminPedidos/Estadisticas.jsx
import { useEffect, useState } from "react";
import Loading from "../../Loading/Loading";

const Estadisticas = () => {
  const [estadisticas, setEstadisticas] = useState({
    ventasTotales: 0,
    pedidosPorEstado: {},
    productosMasVendidos: [],
    totalPedidos: 0,
    tendenciaMensual: [],
    totalClientes: 0,
    clientesConPedidos: 0,
    ticketPromedio: 0,
    carritosAbandonados: 0,
    metodosPago: {},
    tiempoPromedioEntrega: 0,
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
          ventasTotales: data.ventasTotales || 0,
          pedidosPorEstado: data.pedidosPorEstado || {},
          productosMasVendidos: data.productosMasVendidos || [],
          totalPedidos: data.totalPedidos || 0,
          tendenciaMensual: data.tendenciaMensual || [],
          totalClientes: data.totalClientes || 0,
          clientesConPedidos: data.clientesConPedidos || 0,
          ticketPromedio: data.ticketPromedio || 0,
          carritosAbandonados: data.carritosAbandonados || 0,
          metodosPago: data.metodosPago || {},
          tiempoPromedioEntrega: data.tiempoPromedioEntrega || 0,
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
  //console.log('Estadisticas:', estadisticas);
  
  return (
    <div className="bg-gray-50 p-4 md:p-8 rounded-lg">
      <h2 className="text-xl font-semibold mb-6 text-center">Estadísticas del Sistema</h2>
      
      {/* Resumen rápido */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 justify-center text-center">
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium text-gray-500">Clientes Registrados</h3>
            <p className="text-2xl font-bold">{estadisticas.totalClientes}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium text-gray-500">Clientes Activos</h3>
                <p className="text-2xl font-bold">{estadisticas.clientesConPedidos}</p>
            <p className="text-sm text-gray-500 mt-1">
            {((estadisticas.clientesConPedidos / (estadisticas.totalClientes || 1)) * 100 || 0).toFixed(1)}% conversión
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
        {/* <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium text-gray-500">Tiempo Promedio Entrega</h3>
          <p className="text-2xl font-bold">{estadisticas.tiempoPromedioEntrega} días</p>
        </div> */}
      </div>

      {/* Gráficos y estadísticas detalladas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado de pedidos */}
        <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium mb-3">
            Distribución de Pedidos (
            {Object.values(estadisticas.pedidosPorEstado).reduce((total, cantidad) => total + cantidad, 0)} en total
            )
        </h3>
        <div className="space-y-2">
            {Object.entries(estadisticas.pedidosPorEstado).map(([estado, cantidad]) => (
            <div key={estado} className="flex items-center">
                <span className="w-24 capitalize">{estado}:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div 
                    className="bg-blue-500 h-4 rounded-full" 
                    style={{ 
                    width: `${(cantidad / Math.max(1, Object.values(estadisticas.pedidosPorEstado).reduce((a, b) => a + b, 0))) * 100}%` 
                    }}
                ></div>
                </div>
                <span className="ml-2 w-8 text-right">{cantidad}</span>
            </div>
            ))}
        </div>
        </div>

        {/* Productos más vendidos - Top 5 del último año */}
        {/* <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium mb-3">Productos Más Vendidos (Último año)</h3>
        {estadisticas.productosMasVendidos.length > 0 ? (
            <ul className="space-y-3">
            {estadisticas.productosMasVendidos.map((producto, index) => (
                <li key={producto.productoId || index} className="flex justify-between items-center">
                <div className="flex items-center">
                    <span className="font-medium text-gray-700 mr-2">{index + 1}.</span>
                    <span className="truncate">{producto.nombre}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="font-medium">{producto.ventas} unidades</span>
                    <span className="text-sm text-green-600">${producto.ingresos?.toLocaleString() || '0'}</span>
                </div>
                </li>
            ))}
            </ul>
        ) : (
            <p className="text-gray-500 text-center py-4">No hay datos de productos vendidos</p>
        )}
        </div> */}

        {/* Métodos de pago */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium mb-3">Métodos de Pago</h3>
          <div className="space-y-2">
            {Object.entries(estadisticas.metodosPago).map(([metodo, cantidad]) => (
              <div key={metodo} className="flex items-center">
                <span className="w-24 capitalize">{metodo}:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-green-500 h-4 rounded-full" 
                    style={{ 
                      width: `${(cantidad / Math.max(1, Object.values(estadisticas.metodosPago).reduce((a, b) => a + b, 0))) * 100}%` 
                    }}
                  ></div>
                </div>
                <span className="ml-2 w-8 text-right">{cantidad}</span>
              </div>
            ))}
            {Object.keys(estadisticas.metodosPago).length === 0 && (
              <p className="text-gray-500 text-sm">No hay datos de métodos de pago disponibles</p>
            )}
          </div>
        </div>

        {/* Tendencia mensual */}
        {/* <div className="bg-white p-4 rounded-lg shadow lg:col-span-2">
          <h3 className="font-medium mb-3">Tendencia de Ventas Mensuales</h3>
          <div className="flex items-end h-48 gap-2 pt-4">
            {estadisticas.tendenciaMensual.map((mes, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-all"
                  style={{ 
                    height: `${(mes.ventas / Math.max(1, ...estadisticas.tendenciaMensual.map(m => m.ventas))) * 80}%` 
                  }}
                  title={`$${mes.ventas.toLocaleString()}`}
                ></div>
                <span className="text-sm mt-1">{mes.mes}</span>
              </div>
            ))}
          </div>
        </div> */}

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