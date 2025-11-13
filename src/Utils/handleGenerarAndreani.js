import Swal from "sweetalert2";

/**
 * Genera etiquetas de envío de Andreani para los pedidos seleccionados
 * @param {Array<string>} pedidosIds - Array con los IDs de los pedidos
 * @returns {Promise<Object>} Resultado de la generación de etiquetas
 */

const handleGenerarAndreani = async (pedidosIds) => {
  try {
    // Validar que haya pedidos
    if (!pedidosIds || pedidosIds.length === 0) {
      throw new Error('No hay pedidos seleccionados');
    }

    // Mostrar loading
    Swal.fire({
      title: 'Generando etiquetas...',
      html: `Procesando ${pedidosIds.length} pedido(s).<br/>Por favor espere...`,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    console.log('handle: Generando etiquetas para pedidos:', pedidosIds);

    // Llamar a la API para generar etiquetas
    const response = await fetch('/api/etiquetasAndreani', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pedidos: pedidosIds }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.detalle || 'Error al generar etiquetas');
    }

    console.log('Respuesta de generación de etiquetas:', data);

    // Verificar si hay etiquetas generadas
    if (!data.etiquetas || data.etiquetas.length === 0) {
      throw new Error('No se recibieron etiquetas de la API');
    }

    // Cerrar loading
    Swal.close();

    // Mostrar resultado
    const exitosos = data.exitosos || data.etiquetas.length;
    const fallidos = data.fallidos || 0;

    let html = `
      <div style="text-align: left;">
        <p><strong>✓ Exitosos:</strong> ${exitosos}</p>
        ${fallidos > 0 ? `<p><strong>✗ Fallidos:</strong> ${fallidos}</p>` : ''}
    `;

    // Mostrar detalles de errores si existen
    if (data.errores && data.errores.length > 0) {
      html += '<div style="margin-top: 15px;"><strong>Errores:</strong><ul style="text-align: left;">';
      data.errores.forEach(err => {
        html += `<li>Pedido ${err.pedidoId.slice(-6)}: ${err.error}</li>`;
      });
      html += '</ul></div>';
    }

    html += '</div>';

    await Swal.fire({
      icon: exitosos > 0 ? 'success' : 'error',
      title: exitosos > 0 ? 'Etiquetas Generadas' : 'Error',
      html: html,
      confirmButtonText: 'Ver Etiquetas',
      showCancelButton: exitosos > 0,
      cancelButtonText: 'Cerrar',
    }).then((result) => {
      if (result.isConfirmed && exitosos > 0) {
        // Descargar etiquetas
        descargarEtiquetas(data.etiquetas);
      }
    });

    return data;

  } catch (error) {
    console.error('Error en handleGenerarAndreani:', error);
    
    Swal.fire({
      icon: 'error',
      title: 'Error al generar etiquetas',
      html: `
        <div style="text-align: left;">
          <p>${error.message}</p>
          ${error.message.includes('credenciales') ? 
            '<p style="margin-top: 10px;"><small>Verifica que las credenciales de Andreani estén configuradas correctamente en las variables de entorno.</small></p>' : 
            ''
          }
        </div>
      `,
      confirmButtonText: 'Entendido'
    });
    
    return { error: error.message, etiquetas: [] };
  }
};

/**
 * Descarga las etiquetas generadas como archivos PDF
 * @param {Array} etiquetas - Array de etiquetas con datos base64
 */
const descargarEtiquetas = (etiquetas) => {
  try {
    etiquetas.forEach((etiquetaData) => {
      if (etiquetaData.etiquetaExistente) {
        console.log(`Pedido ${etiquetaData.pedidoId} ya tiene etiqueta`);
        return;
      }

      if (!etiquetaData.etiqueta) {
        console.error(`No hay etiqueta para descargar del pedido ${etiquetaData.pedidoId}`);
        return;
      }

      // Convertir base64 a blob
      const byteCharacters = atob(etiquetaData.etiqueta);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `etiqueta-${etiquetaData.trackingCode || etiquetaData.pedidoId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log(`✓ Etiqueta descargada: ${link.download}`);
    });

    Swal.fire({
      icon: 'success',
      title: '¡Descarga completa!',
      text: `Se descargaron ${etiquetas.length} etiqueta(s)`,
      timer: 2000,
      showConfirmButton: false
    });
  } catch (error) {
    console.error('Error al descargar etiquetas:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error al descargar',
      text: 'Hubo un problema al descargar las etiquetas',
    });
  }
};

export default handleGenerarAndreani;
