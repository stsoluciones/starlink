// src/app/api/orders/route.js (o donde tengas la ruta)
import mongoose from "mongoose";
import { connectDB } from "../../../../lib/mongodb";
import Order from "../../../../models/Order";
import Product from "../../../../models/product";
import User from "../../../../models/User";

export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();

    const paymentMethod = body.paymentMethod || "mercadopago";
    const cart = Array.isArray(body.cart) ? body.cart : [];
    const init_point = body.init_point || "";
    const pref_id = body.pref_id || "";
    const uid = body.user?.uid;
    const external_reference = body.external_reference || "";
    const totalFromClient = Number(body.total ?? 0);

    if (!uid || cart.length === 0) {
      return new Response(JSON.stringify({ message: "Faltan datos esenciales (UID o carrito)" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Recalcular el total del servidor para evitar manipulación del cliente
    const cartWithDb = await Promise.all(
      cart.map(async (item) => {
        // Buscamos por cod_producto tal como hacías
        const productoDb = await Product.findOne({ cod_producto: item.cod_producto })
          .select("_id nombre precio foto_1_1 titulo_de_producto cod_producto")
          .lean();

        const precioUnitario = Number(item.precio ?? productoDb?.precio ?? 0);
        const cantidad = Number(item.quantity ?? 0);

        return {
          productoId: productoDb?._id ?? new mongoose.Types.ObjectId(), // sigue cumpliendo "required"
          nombreProducto: productoDb?.nombre || "Producto desconocido",
          cantidad,
          precioUnitario,
          // Extras por si los querés usar más adelante (no se guardan en Opción A)
          _extras: {
            cod_producto: item.cod_producto,
            titulo_de_producto: productoDb?.titulo_de_producto ?? "",
            foto_1_1: item.foto_1_1 ?? productoDb?.foto_1_1 ?? "",
          },
        };
      })
    );

    const totalServer = cartWithDb.reduce((acc, it) => acc + it.precioUnitario * it.cantidad, 0);

    // Tolerancia por redondeo (opcional)
    const diff = Math.abs(totalServer - totalFromClient);
    if (diff > 0.01) {
      // Podés optar por rechazar o reemplazar el total.
      // Acá reemplazo por el total confiable del server.
      // return new Response(JSON.stringify({ message: "Total inválido" }), { status: 400 });
    }

    // ⚙️ Soporte a "efectivo" para coincidir con el schema
    let paymentId;
    if (paymentMethod === "transferencia" || paymentMethod === "efectivo") {
      paymentId = `${paymentMethod}_intent_${new mongoose.Types.ObjectId().toString()}`;
    } else if (paymentMethod !== "mercadopago") {
      return new Response(JSON.stringify({ message: "Método de pago no soportado" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 🧠 Normalización de condición IVA al enum exacto del schema
    let tipoFactura = body.tipoFactura || null;
    if (tipoFactura && typeof tipoFactura === "object") {
      const norm = String(tipoFactura.condicionIva || "").trim().toLowerCase();
      const map = {
        "consumidor final": "consumidorFinal",
        "consumidorFinal": "consumidorFinal",
        "consumidorFInal": "consumidorFinal",
        "ConsumidorFinal": "consumidorFinal",
        "responsable inscripto": "responsableInscripto",
        "responsableInscripto": "responsableInscripto",
        "ResponsableInscripto": "responsableInscripto",
        "responsableIncripto": "responsableInscripto",
        "monotributista": "monotributista",
        "Monotributista": "monotributista",
        "iva exento": "exento",
        "Iva Exento": "exento",
        "ivaexento": "exento",
        "exento": "exento",
      };
      tipoFactura = { ...tipoFactura, condicionIva: map[norm] || "consumidorFinal" };
    }

    // Armar items de acuerdo al schema
    const items = cartWithDb.map((it) => ({
      producto: it.productoId,
      nombreProducto: it.nombreProducto,
      cantidad: it.cantidad,
      precioUnitario: it.precioUnitario,
    }));

    const usuario = await User.findOne({ uid });
    const direccionEnvio = body.direccionEnvio || {};

    const nuevaOrdenData = {
      paymentId,
      usuarioUid: uid,
      usuarioInfo: {
        nombreCompleto: usuario?.nombreCompleto || "",
        correo: usuario?.correo || body.emailUsuario || "",
        telefono: usuario?.telefono || "",
      },
      metadata: { uid, cart }, // si querés purgar datos sensibles, hacelo acá
      tipoFactura,
      direccionEnvio,
      pref_id,
      init_point,
      external_reference,
      paymentMethod,
      items,
      total: Number(totalServer.toFixed(2)),
      // estado: 'pendiente' por default (schema), o podés setear según método:
      estado: paymentMethod === "mercadopago" ? "pendiente" : "pendiente",
    };

    const nuevaOrden = await Order.create(nuevaOrdenData);

    if (usuario?.orders) {
      usuario.orders.push(nuevaOrden._id);
      await usuario.save();
    }

    return new Response(
      JSON.stringify({
        message:
          paymentMethod === "transferencia"
            ? "Orden para transferencia creada. Pendiente de pago."
            : paymentMethod === "efectivo"
            ? "Orden en efectivo creada. Pendiente de confirmación."
            : "Orden guardada",
        orderId: nuevaOrden._id,
        paymentId: nuevaOrden.paymentId,
        order: {
          _id: nuevaOrden._id,
          estado: nuevaOrden.estado,
          total: nuevaOrden.total,
          usuarioInfo: nuevaOrden.usuarioInfo,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error procesando el pago:", error);
    return new Response(
      JSON.stringify({ error: "Error interno", details: error.message || error }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
