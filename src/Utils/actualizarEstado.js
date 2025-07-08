// src/Utils/actualizarEstado.js
import Swal from 'sweetalert2';

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

      if (!result.isConfirmed) return;
    }

    setActualizandoId(id);

    const res = await fetch(`/api/pedidos/actualizar-pedido/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nuevoEstado }),
    });

    const data = await res.json();

    if (res.ok && data.success) { // Verificar res.ok también es una buena práctica
      // No mostramos el Swal de éxito aquí si skipConfirmation es true,
      // porque generarEtiquetas mostrará un Swal de éxito general.
      // Sin embargo, para actualizaciones individuales (donde skipConfirmation sería false), sí es útil.
      if (!skipConfirmation) {
        await Swal.fire({
          title: '¡Actualizado!',
          text: `El estado del pedido ha sido cambiado a "${nuevoEstado}"`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }

      setPedidos((prev) =>
        prev.map((p) => (p._id === id ? data.pedido : p))
      );
      // 🔔 Notificación por correo después del cambio de estado
      try {
        const pedido = data.pedido;
        // console.log('pedido:',pedido);
        // console.log('estoy enviando la notificacion');
        
        
        // Enviar SIEMPRE al cliente
        if (pedido.usuarioInfo.correo && pedido._id) {
          await fetch('/api/notificador', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clienteEmail: pedido.usuarioInfo.correo,
              clienteNombre: pedido.usuarioInfo.nombreCompleto || 'Cliente',
              estadoPedido: pedido.estado,
              adminEmail: pedido.estado === "pagado" && userData?.email ? userData.email : null, // solo si pagado
              numeroPedido: pedido._id,
              montoTotal: pedido.total ?? 0,
            }),
          });
        }
      } catch (error) {
        console.error(`⚠️ Error al enviar notificación del pedido #${data.pedido?._id}:`, error);
      }

      return { success: true, pedido: data.pedido }; // Devolver un resultado puede ser útil
    } else {
      await Swal.fire({
        title: 'Error',
        text: data.message || data.error || 'Error al actualizar estado', // data.error por si el backend lo envía así
        icon: 'error'
      });
      return { success: false, message: data.message || data.error };
    }
  } catch (err) {
    console.error("Error en actualizarEstado:", err); // Mejor log del error
    await Swal.fire({
      title: 'Error de conexión',
      text: 'No se pudo conectar con el servidor o procesar la solicitud.', // Mensaje más genérico
      icon: 'error'
    });
    return { success: false, message: err.message };
  } finally {
    setActualizandoId(null);
  }
};

export default actualizarEstado;