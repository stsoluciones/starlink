// utils/notificador.js
import userData from "../components/constants/userData";


export const notificador = async (pedidoInput) => {
  let pedido = pedidoInput;

  if (!pedido || !pedido.usuarioInfo?.correo || !pedido._id) {
    console.error('⚠️ No se puede notificar: Faltan datos del pedido.');
    return { success: false, error: 'Datos del pedido incompletos' };
  }

  try {
    const response = await fetch('/api/notificador', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clienteEmail: pedido.usuarioInfo?.correo,
        clienteNombre: pedido.usuarioInfo?.nombreCompleto || 'Cliente',
        estadoPedido: pedido.estado,
        adminEmail: userData.email,
        numeroPedido: pedido._id,
        montoTotal: pedido.total ?? 0,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error HTTP: ${response.status}`);
    }

    console.log(`✅ Notificación enviada para #${pedido._id}`);

    return data;
  } catch (error) {
    console.error(`❌ Error al notificar pedido #${pedido._id}:`, error);
    return { success: false, error: error.message };
  }
};

export default notificador;
