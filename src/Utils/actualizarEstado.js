// src/Utils/actualizarEstado.js
import Swal from 'sweetalert2';
// notificador replaced by idempotent server endpoint /api/pedidos/notificar/:id

const actualizarEstado = async (
  id,
  nuevoEstado,
  setActualizandoId,
  setPedidos,
  skipConfirmation = false, // Nuevo parámetro con valor por defecto
  userData
) => {
  try {
    if (!skipConfirmation) { // Solo mostrar confirmación si no se pide omitirla
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: `Vas a cambiar el estado del pedido a "${nuevoEstado}"`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cambiar estado',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
      });

      if (!result.isConfirmed) {
        return { success: false, canceled: true }
      };
    }

    setActualizandoId(id);

    const res = await fetch(`/api/pedidos/actualizar-pedido/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nuevoEstado }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `Error HTTP: ${res.status}`);
    }

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || 'La operación no fue exitosa');
    }
    
    setPedidos(prev => prev.map(p => p._id === id ? data.pedido : p));

      if (!skipConfirmation) {
        await Swal.fire({
          title: '¡Actualizado!',
          text: `El estado del pedido ha sido cambiado a "${nuevoEstado}"`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }

      // 🔔 Notificación por correo después del cambio de estado (idempotente)
      try {
        const pedidoActualizado = data.pedido;
        if (pedidoActualizado && pedidoActualizado._id) {
          const notifRes = await fetch(`/api/pedidos/notificar/${pedidoActualizado._id}`, { method: 'POST' });
          if (!notifRes.ok) {
            console.warn('actualizarEstado - notificar endpoint devolvió error', notifRes.status);
          }
        }
      } catch (error) {
        console.error(`⚠️ Error al enviar notificación del pedido #${data.pedido?._id}:`, error);
        !skipConfirmation && Swal.fire({
          title: 'Notificación fallida',
          text: 'El estado se actualizó pero hubo un error enviando la notificación',
          icon: 'warning',
          timer: 3000
        });
      }

      return { success: true, pedido: data.pedido }; // Devolver un resultado puede ser útil

  } catch (err) {
    console.error("Error en actualizarEstado:", err); // Mejor log del error
    const errorMessage = err.message.includes('HTTP') 
      ? 'Error de conexión con el servidor' 
      : err.message || 'Error al procesar la solicitud';

    await Swal.fire({
      title: 'Error de conexión',
      text: errorMessage, // Mensaje más genérico
      icon: 'error'
    });
    return { success: false, message: errorMessage};
  } finally {
    setActualizandoId(null);
  }
};

export default actualizarEstado;