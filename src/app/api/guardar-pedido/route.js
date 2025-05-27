import { connectDB } from "../../../lib/mongodb";
import Order from "../../../models/Order";
import Product from "../../../models/product";
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
    const paymentMethod = body.paymentMethod || 'mercadopago'; // Asumir mercadopago si no se especifica

    let paymentId;
    let paymentData;
    let payment; // Para la instancia de Payment de Mercado Pago SDK
    let cart = body.cart; // Obtener el carrito directamente del body
    let uid = body.user.uid; // Obtener el UID directamente del body
    let totalOrden = body.total; // Para transferencias, el total vendrá en el body

    // Validaciones iniciales para datos comunes
    if (!uid || !Array.isArray(cart) || cart.length === 0) {
      return new Response(
        JSON.stringify({ message: "Faltan datos esenciales (UID o carrito)" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (paymentMethod === 'mercadopago') {
      paymentId = body.data?.id || body.payment_id;

      if (!paymentId) {
        return new Response(
          JSON.stringify({ message: "Falta paymentId para Mercado Pago" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Verificar si la orden ya existe para Mercado Pago
      const existeMP = await Order.findOne({ paymentId: paymentId.toString() });
      if (existeMP) {
        return new Response(
          JSON.stringify({ message: "Pago de Mercado Pago ya procesado" }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      // Obtener datos del pago de Mercado Pago API
      const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      });

      if (!res.ok) throw new Error("No se pudo obtener el pago de Mercado Pago");
      paymentData = await res.json();

      // Extraer metadata si es necesario para MP (ya lo tienes para UID y cart si vienen de MP)
      // const { metadata } = paymentData;
      // uid = metadata?.uid || uid; // Priorizar metadata si existe
      // cart = metadata?.cart || cart; // Priorizar metadata si existe

      // Obtener el pago usando el SDK de Mercado Pago
      payment = await new Payment(client).get({ id: paymentId });
      if (!payment) {
        return new Response(
          JSON.stringify({ error: "Pago de Mercado Pago no encontrado" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      totalOrden = payment.transaction_amount; // Total desde Mercado Pago

    }  else if (paymentMethod === 'transferencia') {
      // Lógica para crear una orden PENDIENTE de pago por transferencia
      // En este punto, el usuario AÚN NO HA PAGADO. Solo está registrando el pedido.

      // 'comprobanteId', 'bancoOrigen', 'fechaTransferencia' NO se reciben aquí.
      // Se añadirán después, cuando el usuario confirme que ha pagado.

      if (!totalOrden) { // totalOrden debería venir en el body para transferencia
         return new Response(
          JSON.stringify({ message: "Falta el total de la orden para la transferencia" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Generar un ID único para esta intención de pago/orden.
      // El _id de la orden de MongoDB también sirve como identificador único.
      // Podríamos usar un prefijo para distinguirlo o simplemente confiar en el _id.
      // Para consistencia con el campo paymentId, podemos generar uno:
      paymentId = `transf_intent_${new mongoose.Types.ObjectId().toString()}`;

      // NO se verifica si la orden ya existe con 'comprobanteId' porque no lo tenemos.
      // Si quisieras evitar que un usuario cree múltiples pedidos idénticos pendientes de pago
      // muy rápidamente, necesitarías otra lógica (ej. buscar pedidos pendientes recientes del mismo usuario
      // con el mismo carrito), pero generalmente se permite crear el pedido.
      // La duplicidad se maneja al momento de conciliar el PAGO REAL (con el comprobante).

      // No hay 'paymentData' de API para transferencia en este flujo
      // 'payment' (SDK de MP) no se usa aquí
      // El estado inicial será algo como 'pendiente_pago' o 'esperando_transferencia'

    } else {
      return new Response(
        JSON.stringify({ message: "Método de pago no soportado" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Procesamiento común para crear la orden
    const items = await Promise.all(
      cart.map(async (item) => {
        const producto = await Product.findOne({ cod_producto: item.cod_producto });
        return {
          producto: producto?._id ?? new mongoose.Types.ObjectId(),
          cod_producto: item.cod_producto,
          nombre: producto?.nombre || "Producto desconocido",
          cantidad: item.quantity,
          precioUnitario: item.precio,
          foto: producto?.imagen || "",
        };
      })
    );

    const usuario = await User.findOne({ uid });

    const nuevaOrdenData = {
      // Si es transferencia y paymentId se generó como 'transf_intent_...', usarlo.
      // Si no, usar el paymentId de MP. Si ninguno, generar un ObjectId.
      paymentId: paymentId || (paymentMethod === 'mercadopago' && payment?.id.toString()) || new mongoose.Types.ObjectId().toString(),
      usuarioUid: uid,
      usuarioInfo: {
        nombreCompleto: usuario?.nombreCompleto || "",
        correo: usuario?.correo || (paymentMethod === 'mercadopago' && payment?.payer?.email) || body.emailUsuario || "",
      },
      paymentMethod: paymentMethod,
      items,
      direccionEnvio: usuario?.direccion || body.direccionEnvio || "",
      total: totalOrden, // Este es el total calculado o recibido
      // El estado se define más abajo según el método
    };

    if (paymentMethod === 'mercadopago' && payment) {
      nuevaOrdenData.collectionId = payment.id.toString();
      nuevaOrdenData.collectionStatus = payment.estado || "pendiente"; // o el estado que devuelva MP
      nuevaOrdenData.paymentType = payment.payment_type_id;
      nuevaOrdenData.merchantOrderId = payment.order?.id?.toString() || "";
      nuevaOrdenData.preferenceId = payment.metadata?.preference_id || "";
      nuevaOrdenData.siteId = payment.site_id;
      nuevaOrdenData.processingMode = payment.processing_mode;
      nuevaOrdenData.merchantAccountId = payment.metadata?.merchant_account_id || "";
      // payerEmail ya está cubierto en usuarioInfo
      nuevaOrdenData.estado = payment.estado; // Estado del pago de MP
    } else if (paymentMethod === 'transferencia') {
      // Información inicial de la transferencia. Vacía o con datos mínimos.
      // Los detalles del comprobante se añadirán después.
      nuevaOrdenData.transferenciaInfo = {
        // Dejar vacío o con valores por defecto.
        // comprobanteId: null, // Se actualizará después
        // bancoOrigen: null, // Se actualizará después
        // fechaTransferencia: null, // Se actualizará después
      };
      // ESTADO CRÍTICO: Indica que la orden está creada pero el pago no se ha recibido/confirmado.
      nuevaOrdenData.estado = 'pendiente'; // o 'esperando_confirmacion_transferencia'
    }

    // Verificar si la orden ya existe (solo para MercadoPago donde paymentId es del proveedor)
    if (paymentMethod === 'mercadopago') {
        const existeMP = await Order.findOne({ paymentId: paymentData.id.toString() }); // Usar paymentData.id que es el paymentId de MP
        if (existeMP) {
          return new Response(
            JSON.stringify({ message: "Pago de Mercado Pago ya procesado", orderId: existeMP._id }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }
    }
    // Para transferencias, si necesitas evitar duplicados al crear la orden "pendiente de pago",
    // la lógica sería diferente y más compleja (ej. buscar por uid, items y estado pendiente reciente).
    // Por ahora, se permite crear la orden pendiente. La unicidad del pago se verifica con el comprobanteId LUEGO.


    const nuevaOrden = new Order(nuevaOrdenData);
    await nuevaOrden.save();

    if (usuario) {
      usuario.orders.push(nuevaOrden._id);
      await usuario.save();
    }

    // Respuesta para transferencia será diferente, indicando que se espera el pago.
    let responseMessage = "Orden guardada";
    if (paymentMethod === 'transferencia') {
        responseMessage = "Orden para transferencia creada. Pendiente de pago.";
    }

    return new Response(
      JSON.stringify({ message: responseMessage, orderId: nuevaOrden._id, paymentId: nuevaOrden.paymentId }), // Devolver el paymentId asignado a la orden
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error procesando el pago:", error); // Loguear el error en el servidor
    return new Response(
      JSON.stringify({ error: "Error interno", details: error.message || error }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}