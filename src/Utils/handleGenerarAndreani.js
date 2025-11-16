// utils/handleGenerarAndreani.js (por ejemplo)
export async function getSwal() {
  const swal = await import('sweetalert2');
  return swal.default;
}

export async function handleGenerarAndreani(pedidosIds = []) {
  console.log('[handleGenerarAndreani] 🎬 Función iniciada');
  console.log('[handleGenerarAndreani] 📋 Pedidos recibidos:', pedidosIds);
  
  if (!Array.isArray(pedidosIds) || pedidosIds.length === 0) {
    console.warn('[handleGenerarAndreani] ⚠️ No se recibieron IDs de pedidos para generar etiquetas');
    return { error: true, message: 'No hay pedidos para procesar.' };
  }

  try {
    console.log('[handleGenerarAndreani] 📡 Enviando request a /api/andreani/generar-etiquetas');
    console.log('[handleGenerarAndreani] 📦 Payload:', { pedidosIds });
    
    const res = await fetch('/api/andreani/generar-etiquetas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pedidosIds }),
    });

    console.log('[handleGenerarAndreani] 📥 Respuesta recibida, status:', res.status);
    const data = await res.json();
    console.log('[handleGenerarAndreani] 📄 Datos parseados:', data);

    if (!res.ok || !data.success) {
      console.error('[handleGenerarAndreani] ❌ Error en respuesta API');
      console.error('[handleGenerarAndreani] 📊 Status:', res.status);
      console.error('[handleGenerarAndreani] 📝 Data:', data);
      
      if (data.errores && data.errores.length > 0) {
        console.error('[handleGenerarAndreani] 🔍 Errores detallados:', data.errores);
      }
      
      await (await getSwal()).fire({
        title: 'Error al generar etiquetas',
        text: data.message || 'No se pudieron generar las etiquetas en Andreani.',
        icon: 'error',
      });
      return { error: true, ...data };
    }

    console.log('[handleGenerarAndreani] ✅ Etiquetas generadas exitosamente');
    console.log('[handleGenerarAndreani] 📊 Exitosos:', data.exitosos);
    console.log('[handleGenerarAndreani] 📊 Fallidos:', data.fallidos);
    
    // Opcional: abrir la primera etiqueta si es PDF/URL
    if (data.etiquetas?.length && data.etiquetas[0].urlEtiqueta) {
      console.log('[handleGenerarAndreani] 🔗 Abriendo URL de etiqueta:', data.etiquetas[0].urlEtiqueta);
      window.open(data.etiquetas[0].urlEtiqueta, '_blank');
    } else {
      console.log('[handleGenerarAndreani] ℹ️ No hay URL de etiqueta para abrir');
    }

    const result = {
      error: false,
      etiquetas: data.etiquetas || [],
      exitosos: data.exitosos || 0,
      fallidos: data.fallidos || 0,
    };
    console.log('[handleGenerarAndreani] 🏁 Retornando resultado:', result);
    return result;
  } catch (err) {
    console.error('[handleGenerarAndreani] 💥 Error de red al generar etiquetas:', err);
    console.error('[handleGenerarAndreani] 📚 Stack:', err.stack);
    
    await (await getSwal()).fire({
      title: 'Error de conexión',
      text: err.message || 'No se pudo conectar con el servidor.',
      icon: 'error',
    });
    return { error: true, message: err.message };
  }
}
