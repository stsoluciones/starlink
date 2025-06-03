import { useEffect, useState } from "react";
import Loading from "../../Loading/Loading";
import StatsSummary from "./estadistica/StatsSummary";
import StatsProducts from "./estadistica/StatsProducts";
import StatsTrends from "./estadistica/StatsTrends";
import StatsCustomers from "./estadistica/StatsCustomers";

const Estadisticas = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState("semana");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState(null);
  const [trends, setTrends] = useState(null);
  const [customers, setCustomers] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [summaryRes, productsRes, trendsRes, customersRes] = await Promise.all([
          fetch(`/api/estadisticas/resumen?rango=${selectedTimeRange}`),
          fetch(`/api/estadisticas/productos?rango=${selectedTimeRange}&limite=5`),
          fetch('/api/estadisticas/tendencias?meses=12'),
          fetch('/api/estadisticas/clientes')
        ]); 

        
        if (!summaryRes.ok || !productsRes.ok || !trendsRes.ok || !customersRes.ok) {
          throw new Error('Error al cargar datos estadísticos');
        }

        const [summaryData, productsData, trendsData, customersData] = await Promise.all([
          summaryRes.json(),
          productsRes.json(),
          trendsRes.json(),
          customersRes.json()
        ]);

        setSummary(summaryData);
        setProducts(productsData);
        setTrends(trendsData);
        setCustomers(customersData);
        //console.log('summaryData:', summaryData); 
        //console.log('productsData:', productsData);
        //console.log('trendsData:', trendsData);
        //console.log('customersData:', customersData);
      } catch (err) {
        console.error("Error loading statistics:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedTimeRange]);

  if (loading) {
    return <div className="p-4"><Loading /></div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600 bg-red-100 border border-red-400 rounded-lg">
        Error al cargar las estadísticas: {error}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 md:p-8 rounded-lg space-y-8">
      <h2 className="text-xl font-semibold mb-6 text-center">Estadísticas del Sistema</h2>
      
      <div className="mb-6 text-center">
        <label htmlFor="timeRange" className="mr-2 font-medium text-gray-700">Filtrar por:</label>
        <select
          id="timeRange"
          className="border rounded p-2"
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
        >
          <option value="mes_anterior">Mes anterior</option>
          <option value="mes">Mes actual</option>
          <option value="semana">Últimos 7 días</option>
        </select>
      </div>

      {summary && <StatsSummary data={summary} />}
      {customers && <StatsCustomers data={customers} />}
      {/* {products && <StatsProducts data={products} timeRange={selectedTimeRange} />}
      {trends && <StatsTrends data={trends} />} */}
    </div>
  );
};

export default Estadisticas;