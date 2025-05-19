"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const paymentId = searchParams.get("payment_id");

    if (paymentId) {
      fetch("/api/guardar-pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_id: paymentId }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Pedido guardado:", data);
        })
        .catch((err) => console.error("Error:", err));
    }
  }, [searchParams]);

  return <h1>Gracias por tu compra</h1>;
}
