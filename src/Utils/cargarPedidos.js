const cargarPedidos = async (setPedidos, setLoading) => {
  try {
    setLoading(true);
    const res = await fetch("/api/obtener-pedidos");
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    const pedidosData = Array.isArray(data) ? data : data?.pedidos || [];
    
    if (!Array.isArray(pedidosData)) {
      throw new Error("Respuesta inesperada del servidor.");
    }

    const ordenados = pedidosData.sort(
      (a, b) => new Date(b.fechaPedido) - new Date(a.fechaPedido)
    );
    setPedidos(ordenados);

    // This is fire-and-forget, we don't await it since it's not critical
    await fetch("/api/verificar-pedidos", { method: "POST" }).catch(e => 
      console.error("Error en verificar-pedidos:", e)
    );
  } catch (err) {
    console.error("Error al obtener pedidos:", err);
    // You might want to set some error state here
  } finally {
    setLoading(false);
  }
};

export default cargarPedidos;