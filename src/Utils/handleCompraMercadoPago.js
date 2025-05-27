const handleComprarMercadoPago = async ({ cart, user, userData }) => {
    const compraResponse = await fetch("/api/crear-preferencia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        cart, 
        uid: user.uid,
        shippingInfo: { // Enviar información de envío completa
          ...userData.direccion,
          nombreCompleto: userData.nombreCompleto,
          telefono: userData.telefono
        }
      }),
    });
    return compraResponse
}

export default handleComprarMercadoPago;

