// notificador replaced by idempotent server endpoint /api/pedidos/notificar/:id

const handleGuardarPedido = async (user, cart, nuevoDescuento = 0) => {
  // Validaciones iniciales
  if (!user?.uid) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  if (!Array.isArray(cart) || cart.length === 0) {
    return { success: false, error: 'El carrito está vacío' };
  }

  // Normalizar datos mínimos del usuario intentando obtenerlos de varias fuentes
  const normalizeUser = (u) => ({
    uid: u.uid,
    correo: u.correo || u.email || (u.providerData && u.providerData[0] && u.providerData[0].email) || '',
    nombreCompleto: u.nombreCompleto || u.displayName || (u.providerData && u.providerData[0] && u.providerData[0].displayName) || '',
    telefono: u.telefono || u.phoneNumber || u.direccionEnvio?.telefono || (u.direccion && u.direccion.telefono) || '',
    direccion: u.direccion || u.direccionEnvio || {},
    factura: u.factura || {},
    etiquetaEnvio: u.etiquetaEnvio || ''
  });

  let normalized = normalizeUser(user);

  // Si faltan campos importantes, intentar obtener el usuario desde el backend
  const camposRequeridos = ['nombreCompleto', 'telefono', 'direccion', 'correo'];
  const camposFaltantesInicial = camposRequeridos.filter((campo) => {
    if (campo === 'direccion') return !normalized.direccion || Object.keys(normalized.direccion).length === 0;
    return !normalized[campo] || (typeof normalized[campo] === 'string' && normalized[campo].trim() === '');
  });

  if (camposFaltantesInicial.length > 0) {
    try {
      const resp = await fetch(`/api/usuarios/${user.uid}`, { method: 'GET', credentials: 'include' });
      if (resp.ok) {
        const serverUser = await resp.json();
        normalized = { ...normalizeUser(serverUser), ...normalized };
      }
    } catch (err) {
      // no bloquear si falla la obtención del usuario del backend
      console.warn('No se pudo obtener usuario desde backend para completar datos:', err?.message || err);
    }
  }

  // Recalcular campos faltantes
  const camposFaltantes = camposRequeridos.filter((campo) => {
    if (campo === 'direccion') return !normalized.direccion || Object.keys(normalized.direccion).length === 0;
    return !normalized[campo] || (typeof normalized[campo] === 'string' && normalized[campo].trim() === '');
  });

  if (camposFaltantes.length > 0) {
    return {
      success: false,
      error: `Faltan datos obligatorios: ${camposFaltantes.join(', ')}`,
      missing: camposFaltantes
    };
  }

  // Validar estructura del carrito (coercionar precios a number)
  const carritoValido = cart.every((item) =>
    item.cod_producto &&
    Number(item.quantity) > 0 &&
    Number(item.precio) >= 0 &&
    item.nombre
  );

  if (!carritoValido) {
    return { success: false, error: 'El carrito contiene items inválidos' };
  }

  // Preparar payload con valores normalizados
  const totalNumber = cart.reduce((acc, it) => acc + (Number(it.precio) * Number(it.quantity)), 0) * (1 - (Number(nuevoDescuento) / 100));

  const payload = {
    cart: cart.map((item) => ({
      cod_producto: item.cod_producto,
      foto_1_1: item.foto_1_1,
      nombre: item.nombre,
      precio: Number(item.precio) * (1 - (nuevoDescuento / 100)),
      quantity: Number(item.quantity),
      titulo_de_producto: item.titulo_de_producto || '',
    })),
    user: {
      uid: normalized.uid,
      correo: normalized.correo,
      nombreCompleto: normalized.nombreCompleto,
      telefono: normalized.telefono,
      direccion: normalized.direccion,
    },
    direccionEnvio: normalized.direccion,
    tipoFactura: {
      tipo: normalized.factura?.tipo,
      razonSocial: normalized.factura?.razonSocial,
      cuit: normalized.factura?.cuit,
      domicilio: normalized.factura?.domicilio,
      codigoPostal: normalized.factura?.codigoPostal,
      condicionIva: (function(val){
        // map internal keys to Order schema labels
        const map = {
          'consumidorFinal': 'Consumidor Final',
          'responsableInscripto': 'Responsable Inscripto',
          'monotributista': 'Monotributista',
          'exento': 'IVA Exento'
        }
        if (!val) return val
        return map[val] || val
      })(normalized.factura?.condicionIva),
      fecha: new Date(),
    },
    etiquetaEnvio: normalized.etiquetaEnvio || '',
    external_reference: `order_${normalized.uid}_${new Date().getTime()}`,
    pref_id: '',
    paymentId: `transf_intent_${new Date().getTime()}`,
    paymentMethod: 'transferencia',
    estado: 'pendiente',
    total: totalNumber,
  };

  try {
    console.log('handleGuardarPedido - payload:', JSON.parse(JSON.stringify(payload)));
    const response = await fetch('/api/pedidos/guardar-pedido', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorText = '';
      try {
        const errorData = await response.json();
        errorText = errorData.message || JSON.stringify(errorData);
      } catch (e) {
        errorText = await response.text();
      }
      console.error('handleGuardarPedido - backend error:', response.status, errorText);
      // expose response body for debugging in development
      try {
        console.log('handleGuardarPedido - backend response body (raw):', errorText);
      } catch (logErr) {
        console.warn('handleGuardarPedido - could not log response body', logErr);
      }
      return {
        success: false,
        error: errorText || 'Error al guardar el pedido',
        status: response.status,
      };
    }

    const result = await response.json();
    console.log('handleGuardarPedido - success result:', result);
    try {
      const orderId = (result.order && (result.order._id || result.order.id)) || result.orderId || result._id || null;
      if (orderId) {
        // llamar endpoint idempotente para notificar y marcar pagoNotificado
        fetch(`/api/pedidos/notificar/${orderId}`, { method: 'POST' }).catch((e) => console.warn('no se pudo enviar notificacion POST:', e));
      }
    } catch (nErr) {
      console.warn('no se pudo notificar:', nErr?.message || nErr);
    }

    const orderId = result.orderId || (result.order && (result.order._id || result.order.id)) || result._id || null;
    return { success: true, orderId };
  } catch (error) {
    console.error('Error en handleGuardarPedido (exception):', error);
    return {
      success: false,
      error: error.message || 'Error de conexión',
      details: String(error),
    };
  }
};
export default handleGuardarPedido;
