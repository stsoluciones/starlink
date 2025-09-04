// Client helper para notificar errores al servidor
function getBaseUrl() {
  if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return window.location.origin;
}

const notificarError = async (payload = {}) => {
  try {
    const url = `${getBaseUrl()}/api/notificador/error`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Error al notificar: ${resp.status} ${txt}`);
    }

    return await resp.json();
  } catch (err) {
    console.error('notificarError failed:', err);
    throw err;
  }
};

export default notificarError;
