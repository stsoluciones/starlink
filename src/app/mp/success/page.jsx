"use client";
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const params = useSearchParams();

  useEffect(() => {
    const paymentId = params.get("payment_id");

    if (paymentId) {
      fetch(`/api/pedidos/verificar-pago?payment_id=${paymentId}`)
        .then(res => res.json())
        .then(data => {
          console.log("Pago verificado:", data);
          // Mostrar mensaje, redirigir, etc.
        })
        .catch(err => {
          console.error("Error al verificar el pago:", err);
        });
    }
  }, [params]);

  return (
    <div>
      <h1>¡Gracias por tu compra!</h1>
      <p>Estamos procesando tu pedido...</p>
    </div>
  );
}
