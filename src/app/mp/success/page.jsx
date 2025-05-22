"use client";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const paymentId = searchParams.get("payment_id");

    if (paymentId) {
      fetch("/api/guardar-pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_id: paymentId }),
      })
        .then(async (res) => {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            console.log("Pedido guardado:", data);
          } else {
            const text = await res.text();
            console.log("Respuesta texto:", text);
          }
        })
        .catch((err) => console.error("Error:", err));
            }
          }, [searchParams]);

  return (
        <>
        <h1>Gracias por tu compra</h1>
          <Link href="/">
            <button className="btn btn-primary">Volver a la tienda</button>
          </Link>
        </>

      );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}