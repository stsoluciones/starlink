export default function StatsCustomers({ data }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Clientes</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border p-4 rounded-lg">
          <h4 className="text-gray-500">Clientes Registrados</h4>
          <p className="text-2xl font-bold">{data.totalCustomers}</p>
        </div>
        
        <div className="border p-4 rounded-lg">
          <h4 className="text-gray-500">Clientes Activos</h4>
          <p className="text-2xl font-bold">{data.customersWithOrders}</p>
          <p className="text-sm text-gray-500">
            {data.conversionRate.toFixed(1)}% de conversión
          </p>
        </div>
        
        <div className="border p-4 rounded-lg">
          <h4 className="text-gray-500">Nuevos este Mes</h4>
          <p className="text-2xl font-bold">{data.newCustomersThisMonth}</p>
        </div>
      </div>
    </div>
  );
}