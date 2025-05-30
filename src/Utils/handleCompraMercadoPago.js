const handleComprarMercadoPago = async ( cart, userCompleto ) => {
  //console.log('handleComprarMercadoPago called with:', { cart, userCompleto });
  
    const compraResponse = await fetch("/api/pedidos/crear-preferencia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        cart, 
        uid: userCompleto.uid,
        shippingInfo: { 
          ...userCompleto.direccion,
          nombreCompleto: userCompleto.nombreCompleto,
          telefono: userCompleto.telefono
        }
      }),
    });
    return compraResponse
}

export default handleComprarMercadoPago;

