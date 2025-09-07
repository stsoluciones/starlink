import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/mongodb';
import Order from '../../../../../models/Order';
import { sendEmail } from '../../../../../lib/mailer';

export async function POST(req, { params }) {
  await connectDB();
  const { id } = params;
  try {
    const order = await Order.findById(id);
    if (!order) return NextResponse.json({ success: false, error: 'Orden no encontrada' }, { status: 404 });

    if (order.pagoNotificado) {
      return NextResponse.json({ success: true, message: 'Orden ya notificada', alreadyNotified: true });
    }

    // preparar datos para el email
    const clienteEmail = order.usuarioInfo?.correo || '';
    const clienteNombre = order.usuarioInfo?.nombreCompleto || 'Cliente';
    const estadoPedido = order.estado || 'pendiente';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@slsoluciones.com.ar';
    const numeroPedido = order._id.toString();
    const montoTotal = order.total || 0;

    // enviar email al cliente
    await sendEmail({
      to: clienteEmail,
      subject: `Tu pedido #${numeroPedido} ahora está: ${estadoPedido}`,
      html: `<div style="font-family: 'Segoe UI', sans-serif; background-color: #F5F8FA; padding: 24px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
            <div style="background-color: #F3781B; padding: 16px; text-align: center;">
              <img src="https://slsoluciones.com.ar/logos/logo.webp" alt="Logo" style="height: 60px; margin: 0 auto;" />
            </div>
            <div style="padding: 32px;">
              <h2 style="font-size: 20px; margin-bottom: 16px; color: #F3781B;">Hola ${clienteNombre},</h2>
              <p style="font-size: 16px; color: #374151; margin-bottom: 16px;">
                Te informamos que el estado de tu pedido <strong>#${numeroPedido}</strong> ${estadoPedido === 'pendiente' ? 'está consolidado como' : 'ha sido actualizado a'} 
                <span style="font-weight: bold; color: #1a2f98;">${estadoPedido}</span>.
              </p>
              <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">${estadoPedido==='pendiente'? 'Se actualizara a PAGADO cuando corroboremos el ingreso del pago.':''}</p>

              <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
                Gracias por confiar en nosotros. Si tenés alguna consulta, no dudes en responder a este correo.
              </p>
              <a href="https://slsoluciones.com.ar/Dashboard" style="display: inline-block; background-color: #F3781B; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px;">
                Ver mi pedido
              </a>
            </div>
            <div style="background-color: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">
              © ${new Date().getFullYear()} SLS. Todos los derechos reservados.
            </div>
          </div>
        </div>`,
    });

    // email admin
    await sendEmail({
      to: adminEmail,
      subject: `🔔 Pedido #${numeroPedido} en estado ${estadoPedido}`,
      html: `<div style="font-family: 'Segoe UI', sans-serif; background-color: #F5F8FA; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
        <h3>Notificación de Pago</h3>
                <div style="background-color: #F3781B; padding: 16px; text-align: center;">
                    <img src="https://slsoluciones.com.ar/logos/logo.webp" alt="Logo" style="height: 60px; margin: 0 auto;" />
                </div>
                <div style="padding: 32px;">
                    <h2 style="font-size: 20px; margin-bottom: 16px; color: #F3781B;">Hola SLS</h2>
                    <p style="font-size: 16px; color: #374151; margin-bottom: 16px;">
                    Te informamos que el estado del pedido <strong>#${numeroPedido}</strong> a nombre de ${clienteNombre} ha sido actualizado a: 
                    <span style="font-weight: bold; color: #1a2f98;">${estadoPedido}</span>.
                    </p>
                    <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
                    Por un monto Total: <span style="font-weight: bold; color: #1a2f98;">${montoTotal}</span>.
                    </p>
                    <a href="https://slsoluciones.com.ar/Admin" style="display: inline-block; background-color: #F3781B; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px;">
                    Ver Panel de ADM
                    </a>
                </div>
                <div style="background-color: #F3781B; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">
                    © ${new Date().getFullYear()} SLS. Todos los derechos reservados.
                </div>
            </div>
        </div>`,
    });

    order.pagoNotificado = true;
    await order.save();

    return NextResponse.json({ success: true, message: 'Notificación enviada' });
  } catch (error) {
    console.error('Error en API notificar pedido:', error);
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}
