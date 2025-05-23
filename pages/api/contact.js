require('dotenv').config();
const nodemailer = require('nodemailer');
const { SENDER, PASSWORD, TO } = process.env;

export default function contactHandler(req, res) {
  //console.log('req body:', req.body);

  let subject="";
  let html = "";
  if (!req.body.Newsletter) {
    subject= `Mensaje enviado desde Website starlinksoluciones`,
    html = `
    <p>La Persona ha hecho contacto desde el sitio web:</p>
    <p>Nombre: ${req.body.name}</p>
    <p>Email: ${req.body.email}</p>
    <p>Mensaje: ${req.body.message}</p>
    `;
  } else {
    subject= `Agregar Email al NEWSLETTER - starlinksoluciones`,
    html = `
      <p>La Persona ha hecho contacto desde el sitio web:</p>
      <p>Quiere sumarse al Newsletter</p>
      <p>Email: ${req.body.email}</p>
    `;
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: SENDER,
      pass: PASSWORD,
    },
    secure: true,
  });

  const mailData = {
    from: SENDER,
    to: TO,
    subject,
    html,
  };

  transporter.sendMail(mailData, function (err, info) {
    if (err) {
      console.log('error:' + err);
      res.status(500).send('Error al enviar el correo');
    } else {
      //console.log('info:' + info.response);
      res.status(200).send('Correo enviado exitosamente');
    }
  });
}
