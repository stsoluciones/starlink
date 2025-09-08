import mongoose from "mongoose";
import { connectDB } from "../../../../lib/mongodb";
import Order from "../../../../models/Order";
import Product from "../../../../models/product";
import User from "../../../../models/User";

export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();
    //console.log("body back:", body);
    const paymentMethod = body.paymentMethod || "mercadopago";
    const cart = body.cart;
    const init_point = body.init_point || "";
    const pref_id = body.pref_id
    const uid = body.user?.uid;
    const external_reference = body.external_reference || "";
    let totalOrden = body.total;
    
    if (!uid || !Array.isArray(cart) || cart.length === 0) {
      return new Response(
        JSON.stringify({ message: "Faltan datos esenciales (UID o carrito)" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    let paymentId;
    let payment = null;
    

    if (paymentMethod === "transferencia") {
      if (!totalOrden) {
        return new Response(
          JSON.stringify({
            message: "Falta el total de la orden para la transferencia",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      paymentId = `transf_intent_${new mongoose.Types.ObjectId().toString()}`;
    } else if (paymentMethod !== "mercadopago") {
      return new Response(
        JSON.stringify({ message: "Método de pago no soportado" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const items = await Promise.all(
      cart.map(async (item) => {
        const producto = await Product.findOne({
          cod_producto: item.cod_producto,
        });
        return {
          producto: producto?._id ?? new mongoose.Types.ObjectId(),
          cod_producto: item.cod_producto,
          nombre: producto?.nombre || "Producto desconocido",
          external_reference:external_reference,
          titulo_de_producto: producto?.titulo_de_producto || "",
          foto_1_1:item.foto_1_1,
          cantidad: item.quantity,
          precioUnitario: item.precio,
          foto: producto?.foto_1_1 || "",
        };
      })
    );

    const usuario = await User.findOne({ uid });
    const direccionEnvio = body.direccionEnvio;
    let tipoFactura = body.tipoFactura || null;
    // Normalizar condicionIva para evitar errores de enum en el modelo
    if (tipoFactura && typeof tipoFactura === 'object') {
      const val = tipoFactura.condicionIva || '';
      const norm = ('' + val).trim().toLowerCase();
      const map = {
        'consumidor final': 'consumidorFinal',
        'consumidorfinal': 'consumidorFinal',
        'consumidorfinal': 'consumidorFinal',
        'consumidorFinal': 'consumidorFinal',
        'responsable inscripto': 'Responsable Inscripto',
        'responsableinscripto': 'Responsable Inscripto',
        'responsable Inscripto': 'Responsable Inscripto',
        'monotributista': 'Monotributista',
        'iva exento': 'IVA Exento',
        'ivaexento': 'IVA Exento',
      };
      const mapped = map[norm] || tipoFactura.condicionIva || 'consumidorFinal';
      tipoFactura = { ...tipoFactura, condicionIva: mapped };
    }
    const metadata = { uid: uid, cart: cart}
    const nuevaOrdenData = {
      paymentId: paymentId,
      usuarioUid: uid,
      usuarioInfo: {
        nombreCompleto: usuario?.nombreCompleto || "",
        correo:
          usuario?.correo ||
          (paymentMethod === "mercadopago" && payment?.payer?.email) ||
          body.emailUsuario ||
          "",
        telefono:usuario?.telefono,
      },
      metadata: metadata,
      tipoFactura,
      direccionEnvio,
      pref_id:pref_id,
      init_point,
      external_reference: external_reference,
      paymentMethod,
      items,
      total: totalOrden,
    };
    //console.log("Nueva orden a guardar:", nuevaOrdenData);
    if (paymentMethod === "mercadopago" && payment) {
      Object.assign(nuevaOrdenData, {
        collectionId: payment.id.toString(),
        collectionStatus: payment.status || "pendiente",
        paymentType: payment.payment_type_id,
        merchantOrderId: payment.order?.id?.toString() || "",
        preferenceId: payment.metadata?.preference_id || "",
        siteId: payment.site_id,
        processingMode: payment.processing_mode,
        merchantAccountId: payment.metadata?.merchant_account_id || "",
        estado: payment.status,
      });
    } else if (paymentMethod === "transferencia") {
      nuevaOrdenData.transferenciaInfo = {};
      nuevaOrdenData.estado = "pendiente";
    }

    const nuevaOrden = new Order(nuevaOrdenData);
    await nuevaOrden.save();

    if (usuario) {
      usuario.orders.push(nuevaOrden._id);
      await usuario.save();
    }

    const responseMessage =
      paymentMethod === "transferencia"
        ? "Orden para transferencia creada. Pendiente de pago."
        : "Orden guardada";

    return new Response(
      JSON.stringify({
        message: responseMessage,
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
      JSON.stringify({
        error: "Error interno",
        details: error.message || error,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
