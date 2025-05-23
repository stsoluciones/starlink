import { connectDB } from "../../../lib/mongodb";
import Order from "../../../models/Order";
import Product from "../../../models/Product";
import User from "../../../models/User"; // Asegurate de importar esto correctamente
import mongoose from "mongoose";
import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();
    const paymentId = body.data?.id || body.payment_id;

    if (!paymentId) {
      return new Response(
        JSON.stringify({ message: "Falta paymentId" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
    });

    if (!res.ok) throw new Error("No se pudo obtener el pago de Mercado Pago");

    const paymentData = await res.json();
    const { metadata } = paymentData;
    const uid = metadata?.uid;
    const cart = metadata?.cart;

    if (!uid || !Array.isArray(cart)) {
      throw new Error("Datos de carrito o UID no encontrados en metadata");
    }

    const existe = await Order.findOne({ paymentId: paymentId.toString() });
    if (existe) {
      return new Response(
        JSON.stringify({ message: "Ya procesado" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const payment = await new Payment(client).get({ id: paymentId });
    if (!payment) {
      return new Response(
        JSON.stringify({ error: "Pago no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const items = await Promise.all(
      cart.map(async (item) => {
        const producto = await Product.findOne({ cod_producto: item.cod_producto });
        return {
          producto: producto?._id ?? new mongoose.Types.ObjectId(), // fallback
          cantidad: item.quantity,
          precioUnitario: item.precio,
        };
      })
    );

    // Buscar información del usuario
    const usuario = await User.findOne({ uid });

    const payer = payment.payer;
    const nuevaOrden = new Order({
      paymentId: payment.id.toString(),
      collectionId: payment.id.toString(),
      collectionStatus: payment.status,
      paymentType: payment.payment_type_id,
      merchantOrderId: payment.order?.id?.toString() || "",
      preferenceId: payment.metadata?.preference_id || "",
      siteId: payment.site_id,
      processingMode: payment.processing_mode,
      merchantAccountId: payment.metadata?.merchant_account_id || "",
      payerEmail: payer?.email || "",
      status: payment.status,
      total: payment.transaction_amount,
      usuarioUid: uid,
      usuarioInfo: {
        nombreCompleto: usuario?.nombreCompleto || "",
        correo: usuario?.correo || payer?.email || "",
      },
      items,
    });

    await nuevaOrden.save();

    // Asociar la orden al usuario
    if (usuario) {
      usuario.orders.push(nuevaOrden._id);
      await usuario.save();
    }

    return new Response(
      JSON.stringify({ message: "Orden guardada", paymentId: payment.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error interno", details: error.message || error }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
