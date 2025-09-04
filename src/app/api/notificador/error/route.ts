import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '../../../../lib/mailer';
import userData from '../../../../components/constants/userData';

export async function POST(req: NextRequest) {
  try {
    const { subject, message, stack, component, extra } = await req.json();

    const adminEmail = userData.email;

    const html = `
      <div style="font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <h2>Notificación de error en la aplicación</h2>
        <p><strong>Componente:</strong> ${component || 'unknown'}</p>
        <p><strong>Asunto:</strong> ${subject || 'Error en la aplicación'}</p>
        <p><strong>Mensaje:</strong></p>
        <pre style="background:#f6f8fa;padding:12px;border-radius:6px;">${String(message || '')}</pre>
        ${stack ? `<p><strong>Stack:</strong><pre style="background:#f6f8fa;padding:12px;border-radius:6px;">${String(stack)}</pre></p>` : ''}
        ${extra ? `<p><strong>Extra:</strong><pre style="background:#f6f8fa;padding:12px;border-radius:6px;">${JSON.stringify(extra,null,2)}</pre></p>` : ''}
        <hr />
        <p>Time: ${new Date().toISOString()}</p>
      </div>
    `;

    await sendEmail({ to: adminEmail, subject: `ERROR: ${subject || 'Aplicación'}`, html });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error enviando notificación de error:', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
