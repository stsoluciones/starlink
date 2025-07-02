const handleGuardarPedido = async (user, cart) => {
  // Validaciones iniciales
  if (!user?.uid) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  if (!Array.isArray(cart) || cart.length === 0) {
    return { success: false, error: 'El carrito está vacío' };
  }

  // Validar campos obligatorios del usuario
  const camposRequeridos = ['nombreCompleto', 'telefono', 'direccion', 'correo'];
  const camposFaltantes = camposRequeridos.filter(campo => !user[campo]);

  if (camposFaltantes.length > 0) {
    return { 
      success: false, 
      error: `Faltan datos obligatorios: ${camposFaltantes.join(', ')}` 
    };
  }

  // Validar estructura del carrito
  const carritoValido = cart.every(item => 
    item.cod_producto && 
    item.quantity > 0 && 
    item.precio > 0 &&
    item.nombre
  );

  if (!carritoValido) {
    return { success: false, error: 'El carrito contiene items inválidos' };
  }
  // console.log('handleGuardarPedido - Datos del usuario:', user );
  // console.log('handleGuardarPedido - Datos del carrito:', cart );
  
  
  try {
    const response = await fetch('/api/pedidos/guardar-pedido', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        cart: cart.map(item => ({
          cod_producto: item.cod_producto,
          foto_1_1:item.foto_1_1,
          nombre: item.nombre,
          precio: item.precio * 0.85,
          quantity: item.quantity,
          titulo_de_producto: item.titulo_de_producto || '',
        })),
        user: {
          uid: user.uid,
          correo: user.correo,
          nombreCompleto: user.nombreCompleto,
          telefono: user.telefono,
          direccion: user.direccion,
        },
        direccionEnvio: user.direccionEnvio,
        tipoFactura:  {
          tipo: user.factura.tipo,
          razonSocial: user.factura.razonSocial,
          cuit: user.factura.cuit,
          domicilio: user.factura.domicilio,
          codigoPostal: user.factura.codigoPostal,
          condicionIva: user.factura.condicionIva,
          fecha: new Date()
        },
        etiquetaEnvio: user.etiquetaEnvio || '',
        external_reference: `order_${user.uid}_${new Date().getTime()}`,
        direccionEnvio: user.direccionEnvio || user.direccion,
        pref_id: '',
        paymentId: `transf_intent_${new Date().getTime()}`,
        paymentMethod: 'transferencia',
        estado: 'pendiente',
        total: cart.reduce((acc, item) => acc + (item.precio * item.quantity), 0)* 0.85,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { 
        success: false, 
        error: errorData.message || 'Error al guardar el pedido',
        estado: response.estado 
      };
    }

    const result = await response.json();
    return { success: true, orderId: result.orderId };

  } catch (error) {
    console.error('Error en handleGuardarPedido:', error);
    return { 
      success: false, 
      error: error.message || 'Error de conexión',
      details: error 
    };
  }
};
export default handleGuardarPedido;
