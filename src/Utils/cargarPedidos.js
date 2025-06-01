// src/utils/cargarPedidos.js

const cargarPedidos = async (setPedidos, setLoading) => {
  try {
    setLoading(true);
    const res = await fetch("/api/pedidos/obtener-pedidos");

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    const pedidosData = Array.isArray(data) ? data : data?.pedidos || [];

    if (!Array.isArray(pedidosData)) {
      throw new Error("Respuesta inesperada del servidor.");
    }

    const ordenados = pedidosData.sort(
      (a, b) => new Date(b.fechaPedido || 0) - new Date(a.fechaPedido || 0)
    );
    setPedidos(ordenados);


  } catch (err) {
    console.error("Error al obtener pedidos:", err);
  } finally {
    setLoading(false);
  }
};

export default cargarPedidos;
