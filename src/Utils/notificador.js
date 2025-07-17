import userData from "../components/constants/userData";

const notificador = async (pedidoInput) => {
  try {
    let pedido = pedidoInput;

    // Si lo que recibimos NO es un objeto completo (ej: solo el ID), hacemos fetch al backend
    if (!pedido?.usuarioInfo || !pedido?.estado) {
      const res = await fetch(`/api/pedidos/obtener-pedido/${pedidoInput}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'No se pudo obtener el pedido');
      pedido = data.pedido;
    }

    // Ahora que tenemos el objeto completo del pedido, enviamos la notificación
    if (pedido.usuarioInfo?.correo && pedido._id) {
      await fetch('/api/notificador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteEmail: pedido.usuarioInfo.correo,
          clienteNombre: pedido.usuarioInfo.nombreCompleto || 'Cliente',
          estadoPedido: pedido.estado,
          adminEmail: userData?.email || null, // solo si pagado
          tracking: pedido.trackingCode !== "",
          numeroPedido: pedido._id,
          montoTotal: pedido.total ?? 0,
        }),
      });
    }
  } catch (error) {
    console.error(`Error al enviar notificación del pedido:`, error);
  }
};

export default notificador;
