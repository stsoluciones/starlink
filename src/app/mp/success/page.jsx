"use client";
import { useEffect } from "react";

export default function SuccessPage() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get("payment_id");

    if (paymentId) {
      fetch(`/api/pedidos/verificar-pago?payment_id=${paymentId}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Pago verificado:", data);
        })
        .catch((err) => {
          console.error("Error al verificar el pago:", err);
        });
    }
  }, []);

  return (
    <div>
      <h1>¡Gracias por tu compra!</h1>
      <p>Estamos procesando tu pedido...</p>
    </div>
  );
}
