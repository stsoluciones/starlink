//src/lib/verifyMercadoPagoPayment.ts
import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

/**
 * Verifica un pago de Mercado Pago utilizando el SDK oficial.
 * @param {string} paymentId - ID del pago de Mercado Pago
 * @returns {Promise<object>} Detalles del pago
 */
export default async function verifyMercadoPagoPayment(paymentId: string) {
  if (!paymentId) {
    throw new Error("No se proporcionó paymentId");
  }

  try {
    const payment = await new Payment(client).get({ id: paymentId });

    if (!payment) {
      throw new Error("Pago no encontrado en Mercado Pago");
    }

    return payment;
  } catch (error) {
    console.error("Error al verificar el pago:", error);
    throw new Error("No se pudo obtener el pago de Mercado Pago");
  }
}
