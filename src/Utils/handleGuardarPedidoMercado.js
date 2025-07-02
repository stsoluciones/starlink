//app/Utils/handleGuardarPedidoMercado.js

const handleGuardarPedidoMercado = async (user, cart, compraData) => {
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
  //console.log('compraData:', compraData);

  
  const prefId = compraData?.pref_id || compraData?.preference_id;
  const externalReference = compraData?.external_reference || compraData?.external_reference_id;
  //console.log('externalReference:', externalReference);
  
  try {
    //console.log('Iniciando guardado de pedido con MercadoPago');    
    const response = await fetch('/api/pedidos/guardar-pedido', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        cart: cart.map(item => ({
          cod_producto: item.cod_producto,
          nombre: item.nombre,
          precio: item.precio,
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
        tipoFactura: {
          tipo: user.factura.tipo,
          razonSocial: user.factura.razonSocial,
          cuit: user.factura.cuit,
          domicilio: user.factura.domicilio,
          codigoPostal: user.factura.codigoPostal,
          condicionIva: user.factura.condicionIva,
          fecha: new Date()
        } ,
        external_reference: externalReference,
        init_point: compraData?.init_point || '',
        pref_id: prefId,
        paymentId: prefId,
        paymentMethod: 'mercadopago',
        estado: 'pendiente',
        total: cart.reduce((acc, item) => acc + (item.precio * item.quantity), 0),
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
    console.error('Error en handleGuardarPedidoMercado:', error);
    return { 
      success: false, 
      error: error.message || 'Error de conexión',
      details: error 
    };
  }
};
export default handleGuardarPedidoMercado;
