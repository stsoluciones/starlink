"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get("payment_id");

    if (paymentId) {
      fetch(`/api/pedidos/verificar-pago?payment_id=${paymentId}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Pago verificado:");
        })
        .catch((err) => {
          console.error("Error al verificar el pago:", err);
        });
    }

    const timer = setTimeout(() => {
      router.push("/Dashboard");
    }, 5000); // redirige a los 5 segundos

    return () => clearTimeout(timer); // limpieza del timeout
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">¡Gracias por tu compra!</h1>
        <p className="text-gray-700 mb-6">Estamos procesando tu pedido. Serás redirigido en unos segundos...</p>
        <button
          onClick={() => router.push("/Dashboard")}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
        >
          Ir al Dashboard ahora
        </button>
      </div>
    </div>
  );
}
