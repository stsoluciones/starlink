import Swal from "sweetalert2";

const handleGenerarAndreani = async (pedidosIds) => {
  try {
    const response = await fetch('/api/etiquetasAndreani', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pedidos: pedidosIds }),
    });

    if (!response.ok) {
      throw new Error('Error al generar etiquetas');
    }

    const data = await response.json();

    if (!data.etiquetas || data.etiquetas.length === 0) {
      throw new Error('No se recibieron etiquetas');
    }

    return data.etiquetas;  // 👈 Devuelve las etiquetas correctamente
  } catch (error) {
    console.error('Error:', error);
    Swal.fire('Error', 'No se pudieron generar las etiquetas', 'error');
    return [];
  }
};

export default handleGenerarAndreani;
