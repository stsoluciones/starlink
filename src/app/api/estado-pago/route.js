//app/api/estado-pago/route.js
import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { timeout: 5000 }
});

// Cache simple en memoria (solo para desarrollo, en producción usar Redis/Memcached)
const cache = new Map();
const CACHE_TTL = 30000; // 30 segundos

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get("payment_id");

  // 1. Validación del paymentId
  if (!paymentId || !/^\d+$/.test(paymentId)) {
    return NextResponse.json(
      { error: "Se requiere un payment_id válido (solo números)" },
      { status: 400 }
    );
  }

  // 2. Verificar cache
  if (cache.has(paymentId)) {
    const cached = cache.get(paymentId);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }
  }

  try {
    // 3. Obtener estado del pago
    const payment = await new Payment(mercadopago).get({ id: paymentId });
    const responseData = payment.body;

    // 4. Almacenar en cache
    cache.set(paymentId, {
      data: responseData,
      timestamp: Date.now()
    });

    // 5. Formatear respuesta
    const formattedResponse = {
      id: responseData.id,
      status: responseData.status,
      amount: responseData.transaction_amount,
      fecha: responseData.date_approved,
      detalle: responseData.status_detail
    };

    return NextResponse.json(formattedResponse);

  } catch (error) {
    console.error("Error al obtener estado del pago:", error);

    // Manejo específico de errores de MP
    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: "Pago no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: "Error al consultar el estado del pago",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}