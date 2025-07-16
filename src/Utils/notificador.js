import userData from "../components/constants/userData";

const notificador = async (pedido)=>{
    //console.log('pedido en notificado:', pedido)
    try{
        if (pedido.usuarioInfo.correo && pedido._id) {
            await fetch('/api/notificador', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clienteEmail: pedido.usuarioInfo.correo,
                    clienteNombre: pedido.usuarioInfo.nombreCompleto || 'Cliente',
                    estadoPedido: pedido.estado,
                    adminEmail: userData?.email ? userData.email : null, // solo si pagado
                    tracking: pedido.trackingCode !== "",
                    numeroPedido: pedido._id,
                    montoTotal: pedido.total ?? 0,
                }),
            });
        }
    } catch (error) {
        console.error(`Error al enviar notificación del pedido #${data.pedido?._id}:`, error);
    }
}
export default notificador