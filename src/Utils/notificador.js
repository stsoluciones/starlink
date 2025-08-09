// utils/notificador.js
import userData from "../components/constants/userData";

function getBaseUrl() {
  if (typeof window === "undefined") {
    // Producción: poné tu dominio (https://tudominio.com) en NEXT_PUBLIC_BASE_URL
    return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  }
  return window.location.origin;
}

export const notificador = async (pedidoInput) => {
  const pedido = pedidoInput;

  if (!pedido || !pedido.usuarioInfo?.correo || !pedido._id) {
    console.error('⚠️ No se puede notificar: Faltan datos del pedido.');
    return { success: false, error: 'Datos del pedido incompletos' };
  }

  try {
    const url = `${getBaseUrl()}/api/notificador`;

    const response = await fetch(url, {
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

    const data = await response.json(); // ✅ parsear una sola vez

    if (!response.ok) {
      throw new Error(data?.message || `Error HTTP: ${response.status}`);
    }

    console.log(`✅ Notificación enviada para #${pedido._id}`);
    return data;
  } catch (error) {
    console.error(`❌ Error al notificar pedido #${pedido._id}:`, error);
    return { success: false, error: error.message };
  }
};

export default notificador;
