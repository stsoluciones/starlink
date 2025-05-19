import { useEffect, useState } from "react";

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const estados = ["pendiente", "pagado", "procesando", "enviado", "entregado", "cancelado"];

  useEffect(() => {
    fetch("/api/obtener-pedidos")
      .then((res) => res.json())
      .then((data) => {
        setPedidos(data);
        setLoading(false);
      });
  }, []);

  const actualizarEstado = async (id, nuevoEstado) => {
    const res = await fetch(`/api/actualizar-pedido/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nuevoEstado }),
    });
    const data = await res.json();
    if (data.success) {
      setPedidos((prev) => prev.map((p) => (p._id === id ? data.pedido : p)));
    }
  };

  if (loading) return <div className="p-4">Cargando pedidos...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Administrar Pedidos</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Cliente</th>
              <th className="px-4 py-2 text-left">Estado</th>
              <th className="px-4 py-2 text-left">Total</th>
              <th className="px-4 py-2">Cambiar Estado</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido._id} className="border-t">
                <td className="px-4 py-2 text-sm">{pedido._id}</td>
                <td className="px-4 py-2 text-sm">{pedido.usuarioInfo?.nombreCompleto || "Sin nombre"}</td>
                <td className="px-4 py-2 text-sm font-semibold">{pedido.estado}</td>
                <td className="px-4 py-2 text-sm">${pedido.total}</td>
                <td className="px-4 py-2">
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={pedido.estado}
                    onChange={(e) => actualizarEstado(pedido._id, e.target.value)}
                  >
                    {estados.map((estado) => (
                      <option key={estado} value={estado}>{estado}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
