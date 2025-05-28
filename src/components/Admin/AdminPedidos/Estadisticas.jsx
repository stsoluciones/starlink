// componentes/Admin/AdminPedidos/Estadisticas.jsx
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
  const [rango, setRango] = useState("semana");

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        setEstadisticas(prev => ({ ...prev, loading: true }));

        const response = await fetch(`/api/Estadisticas?rango=${rango}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
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
        console.error("Error cargando estadísticas:", error);
        setEstadisticas(prev => ({ ...prev, loading: false }));
      }
    };

    cargarEstadisticas();
  }, [rango]);

  if (estadisticas.loading) {
    return <div className="p-4"><Loading /></div>;
  }

  return (
    <div className="bg-gray-50 p-4 md:p-8 rounded-lg">
      <h2 className="text-xl font-semibold mb-6 text-center">Estadísticas del Sistema</h2>
      <div className="mb-6 text-center">
        <label htmlFor="rango" className="mr-2 font-medium text-gray-700">Filtrar por:</label>
        <select
          id="rango"
          className="border rounded p-2"
          value={rango}
          onChange={(e) => setRango(e.target.value)}
        >
          <option value="mes_anterior">Mes anterior</option>
          <option value="mes">Último mes</option>
          <option value="semana">Última semana</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 justify-center text-center">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium text-gray-500">Clientes Registrados</h3>
          <p className="text-2xl font-bold">{estadisticas.totalClientes}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium text-gray-500">Clientes Activos</h3>
          <p className="text-2xl font-bold">{estadisticas.clientesConPedidos}</p>
          <p className="text-sm text-gray-500 mt-1">
            {((estadisticas.clientesConPedidos / (estadisticas.totalClientes || 1)) * 100).toFixed(1)}% conversión
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium mb-3">Carritos Abandonados</h3>
          <p className="text-3xl font-bold text-red-500">{estadisticas.carritosAbandonados}</p>
          <p className="text-sm text-gray-500 mt-2">Últimos 30 días</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium mb-3">Tasa de Conversión</h3>
          <p className="text-3xl font-bold text-green-500">
            {((estadisticas.totalPedidos / Math.max(1, estadisticas.totalClientes)) * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default Estadisticas;
