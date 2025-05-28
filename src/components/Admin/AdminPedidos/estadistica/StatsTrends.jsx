import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function StatsTrends({ data }) {
  const chartData = {
    labels: data.monthlyTrend.map(item => `${item.month}/${item.year}`),
    datasets: [
      {
        label: 'Ventas Totales',
        data: data.monthlyTrend.map(item => item.totalSales),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
      {
        label: 'Pedidos Totales',
        data: data.monthlyTrend.map(item => item.totalOrders),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Tendencia de Ventas (Últimos 12 Meses)',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Tendencias</h3>
      <Bar data={chartData} options={options} />
    </div>
  );
}