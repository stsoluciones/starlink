import Image from "next/image";

export default function StatsProducts({ data, timeRange }) {
  const rangeText = {
    'mes': 'este mes',
    'mes_anterior': 'el mes anterior',
    'semana': 'la última semana'
  }[timeRange];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Productos Más Vendidos ({rangeText})</h3>
      
      {data.topSellingProducts.length > 0 ? (
        <div className="space-y-4">
          {data.topSellingProducts.map((product) => (
            <div key={product.productId} className="flex items-center justify-between p-3 border-b">
              <div className="flex items-center space-x-3">
                {product.productImage && (
                  <Image
                    width={48}
                    height={48}
                    unoptimized={true} 
                    src={product.productImage} 
                    alt={product.productName} 
                    className="w-12 h-12 object-cover rounded-md"
                    title={product.productName}
                    aria-label={product.productName}
                  />
                )}
                <span>{product.productName}</span>
              </div>
              <div className="text-right">
                <p className="font-bold">{product.totalSoldQuantity} unidades</p>
                <p className="text-sm text-gray-500">
                  ${product.totalRevenue.toLocaleString()} en ventas
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No hay datos de productos vendidos para este período.</p>
      )}
    </div>
  );
}