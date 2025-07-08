// lib/mailer.js
require('dotenv').config();
const nodemailer = require('nodemailer');

const { SENDER, PASSWORD } = process.env;

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: SENDER,
    pass: PASSWORD,
  },
});

/**
 * Envía un correo utilizando Nodemailer.
 * @param {Object} options - Opciones para el envío.
 * @param {string} options.to - Correo destinatario.
 * @param {string} options.subject - Asunto del correo.
 * @param {string} options.html - Cuerpo en HTML.
 * @returns {Promise}
 */
const sendEmail = ({ to, subject, html }) => {
  const mailOptions = {
    from: SENDER,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };
