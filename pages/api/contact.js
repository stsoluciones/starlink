// pages/api/contact.js (o app/api/contact/route.js si usás App Router)
const { sendEmail } = require('../../src/lib/mailer');
const { TO } = process.env;

export default async function contactHandler(req, res) {
  const { name, email, message, Newsletter } = req.body;

  let subject = '';
  let html = '';

  if (!Newsletter) {
    subject = 'Mensaje enviado desde Website starlinksoluciones';
    html = `
        <div style="font-family: 'Segoe UI', sans-serif; background-color: #f9fafb; padding: 24px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
            <div style="background-color: #F3781B; padding: 16px; text-align: center;">
                <img src="https://slsoluciones.com.ar/logos/logo.webp" alt="Logo" style="height: 60px; margin: 0 auto;" />
            </div>
            <div style="padding: 32px;">
                <h2 style="font-size: 20px; margin-bottom: 16px; color: #F3781B;">Hola SLS,</h2>
                <p style="font-size: 16px; color: #374151; margin-bottom: 16px;">
                <p style="font-size: 16px; color: #374151; margin-bottom: 24px;"><span style="font-weight: bold; color: #F3781B;">${name} </span> se contacto desde la web: </p>
                <p style="font-size: 16px; color: #374151; margin-bottom: 24px;"> Te dejo este mensaje:<br/><span style="font-size: 16px; color: #374151; margin-bottom: 24px;"><span style="font-weight: bold; color: #F3781B;">${message}</span> <br/><br/>
                Para responderle hace click en este correo: ${email}.</p>
                <a href="https://slsoluciones.com.ar/Dashboard" style="display: inline-block; background-color: #F3781B; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px;">
                Ver Panel de ADM
                </a>
            </div>
            <div style="background-color: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">
                © ${new Date().getFullYear()} SLS. Todos los derechos reservados.
            </div>
            </div>
        </div>
    `;
  } else {
    subject = 'Agregar Email al NEWSLETTER - starlinksoluciones';
    html = `
      <p>La Persona ha hecho contacto desde el sitio web:</p>
      <p>Quiere sumarse al Newsletter</p>
      <p>Email: ${email}</p>
    `;
  }

  try {
    await sendEmail({ to: TO, subject, html });
    res.status(200).send('Correo enviado exitosamente');
  } catch (err) {
    console.error('Error al enviar correo:', err);
    res.status(500).send('Error al enviar el correo');
  }
}
