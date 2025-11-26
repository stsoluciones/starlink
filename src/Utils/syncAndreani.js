const handleSyncAndreani = async (id) => {
  try {
    setActualizandoId(id);

    const res = await fetch(`/api/pedidos/actualizar-pedido/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ syncDesdeAndreani: true }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || data.message || 'Error al sincronizar con Andreani');
    }

    setPedidos((prev) =>
      prev.map((p) => (p._id === id ? data.pedido : p))
    );

    await Swal.fire({
      title: 'Estado actualizado',
      html: `
        <p><b>Estado Andreani:</b> ${data.andreani?.descripcion || '-'}</p>
        <p><b>Código:</b> ${data.andreani?.codigo || '-'}</p>
        ${
          data.esEntregado
            ? '<p class="text-green-600 mt-2"><b>El pedido fue marcado como ENTREGADO.</b></p>'
            : ''
        }
      `,
      icon: 'success',
    });
  } catch (err) {
    console.error('Error en handleSyncAndreani:', err);
    await Swal.fire({
      title: 'Error',
      text: err.message || 'Error al sincronizar con Andreani',
      icon: 'error',
    });
  } finally {
    setActualizandoId(null);
  }
};
export default handleSyncAndreani;