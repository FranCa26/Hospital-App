/// archivo para enviar correos electrónicos con nodemailer

const nodemailer = require("nodemailer")
require("dotenv").config();

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log(
  "EMAIL_PASSWORD:",
  process.env.EMAIL_PASSWORD ? "Cargado correctamente" : "No cargado"
);
// Configuración del transporte de correo
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "tu-email@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "tu-contraseña",
  },
})

// Función para enviar correos electrónicos
const enviarEmail = async (destinatario, asunto, contenido, esHtml = false) => {
  try {
    // Opciones del correo
    const mailOptions = {
      from: `"Sistema de Turnos" <${process.env.EMAIL_USER || "sistema@hospital.com"}>`,
      to: destinatario,
      subject: asunto,
      [esHtml ? "html" : "text"]: contenido,
    }

    // Enviar correo
    const info = await transporter.sendMail(mailOptions)
    console.log("Correo enviado:", info.messageId)

    return true
  } catch (error) {
    console.error("Error al enviar correo:", error)
    return false
  }
}

// Plantilla para correo de confirmación de turno
const plantillaTurnoConfirmado = (nombrePaciente, nombreMedico, servicio, fecha, hora) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #3498db;">Confirmación de Turno</h2>
      <p>Hola ${nombrePaciente},</p>
      <p>Su turno ha sido confirmado con los siguientes detalles:</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <p><strong>Médico:</strong> ${nombreMedico}</p>
        <p><strong>Servicio:</strong> ${servicio}</p>
        <p><strong>Fecha:</strong> ${fecha}</p>
        <p><strong>Hora:</strong> ${hora}</p>
      </div>
      <p>Por favor, llegue 15 minutos antes de su turno. Si necesita cancelar o reprogramar, hágalo con al menos 24 horas de anticipación.</p>
      <p>Gracias por confiar en nosotros para su atención médica.</p>
      <p style="margin-top: 30px; font-size: 12px; color: #777;">Este es un correo automático, por favor no responda a este mensaje.</p>
    </div>
  `
}

module.exports = {
  enviarEmail,
  plantillaTurnoConfirmado,
}

