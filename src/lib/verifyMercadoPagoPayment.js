// src/lib/verifyMercadoPagoPayment.ts
import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const verifyMercadoPagoPayment = async (paymentId) => {
  console.log("verifyMercadoPagoPayment paymentId:", paymentId);

  if (!paymentId) {
    throw new Error("No se proporcionó paymentId");
  }

  try {
    const payment = await new Payment(client).get({ id: paymentId });

    if (!payment) {
      throw new Error("Pago no encontrado en Mercado Pago");
    }

    return {
      status: payment.status,
      payment_method_id: payment.payment_method_id,
      id: payment.id,
    };
  } catch (error) {
    console.error("Error al verificar el pago:", error);
    throw new Error("No se pudo obtener el pago de Mercado Pago");
  }
};

export default verifyMercadoPagoPayment;
