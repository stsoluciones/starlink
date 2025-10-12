import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Order from '../../../../models/Order';
import { sendEmail } from '../../../../lib/mailer';

export async function POST(req) {
  await connectDB();
  
  try {
    const { pedidoIds } = await req.json();
    
    if (!pedidoIds || !Array.isArray(pedidoIds) || pedidoIds.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Debe proporcionar al menos un ID de pedido' 
      }, { status: 400 });
    }

    const resultados = [];

    for (const pedidoId of pedidoIds) {
      try {
        const order = await Order.findById(pedidoId);
        
        if (!order) {
          resultados.push({ 
            pedidoId, 
            success: false, 
            error: 'Pedido no encontrado' 
          });
          continue;
        }

        // Verificar que sea pendiente y MercadoPago
        if (order.estado !== 'pendiente' || order.paymentMethod !== 'mercadopago') {
          resultados.push({ 
            pedidoId, 
            success: false, 
            error: 'El pedido debe estar pendiente y ser de MercadoPago' 
          });
          continue;
        }

        // Verificar que tenga init_point
        if (!order.init_point) {
          resultados.push({ 
            pedidoId, 
            success: false, 
            error: 'El pedido no tiene un enlace de pago' 
          });
          continue;
        }

        const clienteEmail = order.usuarioInfo?.correo || '';
        const clienteNombre = order.usuarioInfo?.nombreCompleto || 'Cliente';
        const numeroPedido = order._id.toString().slice(-6);
        const montoTotal = order.total || 0;
        const initPoint = order.init_point;

        // Enviar email de recordatorio
        await sendEmail({
          to: clienteEmail,
          subject: `⏰ Recordatorio: Completa el pago de tu pedido #${numeroPedido}`,
          html: `<div style="font-family: 'Segoe UI', sans-serif; background-color: #F5F8FA; padding: 24px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
              <div style="background-color: #F3781B; padding: 16px; text-align: center;">
                <img src="https://slsoluciones.com.ar/logos/logo.webp" alt="Logo" style="height: 60px; margin: 0 auto;" />
              </div>
              <div style="padding: 32px;">
                <h2 style="font-size: 20px; margin-bottom: 16px; color: #F3781B;">Hola ${clienteNombre},</h2>
                <p style="font-size: 16px; color: #374151; margin-bottom: 16px;">
                  Notamos que tu pedido <strong>#${numeroPedido}</strong> aún está pendiente de pago.
                </p>
                <p style="font-size: 16px; color: #374151; margin-bottom: 16px;">
                  <strong>Monto total:</strong> ${montoTotal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                </p>
                <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
                  Para completar tu compra, hacé clic en el botón de abajo y terminá el proceso de pago a través de MercadoPago.
                </p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${initPoint}" 
                     style="display: inline-block; background-color: #009EE3; color: white; padding: 16px 32px; border-radius: 6px; text-decoration: none; font-size: 18px; font-weight: bold;">
                    💳 Completar Pago
                  </a>
                </div>
                <p style="font-size: 14px; color: #6b7280; margin-top: 24px; text-align: center;">
                  Si no podés ver el botón, copiá este enlace en tu navegador:<br>
                  <a href="${initPoint}" style="color: #009EE3; word-break: break-all;">${initPoint}</a>
                </p>
                <p style="font-size: 14px; color: #374151; margin-top: 24px;">
                  Si tenés alguna duda o problema, no dudes en contactarnos respondiendo a este correo.
                </p>
              </div>
              <div style="background-color: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">
                © ${new Date().getFullYear()} SLS. Todos los derechos reservados.
              </div>
            </div>
          </div>`,
        });

        // Actualizar fecha de último recordatorio
        await Order.updateOne(
          { _id: order._id }, 
          { $set: { ultimoRecordatorio: new Date() } }
        );

        resultados.push({ 
          pedidoId, 
          success: true, 
          email: clienteEmail 
        });

      } catch (error) {
        console.error(`Error procesando pedido ${pedidoId}:`, error);
        resultados.push({ 
          pedidoId, 
          success: false, 
          error: error.message 
        });
      }
    }

    const exitosos = resultados.filter(r => r.success).length;
    const fallidos = resultados.filter(r => !r.success).length;

    return NextResponse.json({ 
      success: exitosos > 0,
      message: `Se enviaron ${exitosos} recordatorio(s) de pago. ${fallidos > 0 ? `${fallidos} fallaron.` : ''}`,
      resultados 
    });

  } catch (error) {
    console.error('Error en API recordatorio-pago:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
