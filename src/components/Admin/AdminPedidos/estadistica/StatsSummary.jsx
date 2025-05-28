export default function StatsSummary({ data }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Resumen General</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="border p-4 rounded-lg">
          <h4 className="text-gray-500">Ventas Totales</h4>
          <p className="text-2xl font-bold">${data.totalSales.toLocaleString()}</p>
        </div>
        <div className="border p-4 rounded-lg">
          <h4 className="text-gray-500">Pedidos Totales</h4>
          <p className="text-2xl font-bold">{data.totalOrders}</p>
        </div>
        <div className="border p-4 rounded-lg">
          <h4 className="text-gray-500">Tasa de Cancelación</h4>
          <p className="text-2xl font-bold">{data.cancellationRate.toFixed(2)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium mb-2">Estado de Pedidos</h4>
          <div className="space-y-2">
            {Object.entries(data.ordersByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center">
                <span className="w-32 capitalize">{status}:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-blue-500 h-4 rounded-full" 
                    style={{ width: `${(count / data.totalOrders) * 100}%` }}
                  />
                </div>
                <span className="ml-2 w-12 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
        <h4 className="font-medium mb-2">Métodos de Pago</h4>
        <div className="space-y-2">
            {data.paymentMethods ? (
            Object.entries(data.paymentMethods).map(([method, count]) => (
                <div key={method} className="flex items-center">
                <span className="w-32 capitalize">{method}:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div 
                    className="bg-green-500 h-4 rounded-full" 
                    style={{ width: `${(count / data.totalOrders) * 100}%` }}
                    />
                </div>
                <span className="ml-2 w-12 text-right">{count}</span>
                </div>
            ))
            ) : (
            <p className="text-gray-500">No hay datos de métodos de pago disponibles</p>
            )}
        </div>
        </div>
      </div>
    </div>
  );
}