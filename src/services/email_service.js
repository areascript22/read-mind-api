// sendgrid-service.js
import sgMail from "@sendgrid/mail";

// Configurar API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async ({ to, subject, text, html }) => {
  console.log("📨 [SendEmail] Iniciando envío de correo...");
  console.log("📨 Destinatario:", to);
  console.log("📨 Asunto:", subject);

  // Validaciones básicas
  if (!to || !subject || (!text && !html)) {
    console.error("❌ [SendEmail] Faltan parámetros obligatorios.");
    throw new Error("Missing parameters for sendEmail");
  }

  const msg = {
    to,
    from: process.env.MAIL_FROM, // remitente verificado
    subject,
    text,
    html,
  };

  try {
    console.log("📤 [SendEmail] Enviando correo a SendGrid...");
    const response = await sgMail.send(msg);

    console.log("✅ [SendEmail] Correo enviado correctamente!");
    console.log("📬 Status Code:", response[0]?.statusCode);
    console.log("📬 Headers:", response[0]?.headers);

    return response;
  } catch (err) {
    // Logs detallados del error de SendGrid
    console.error("❌ [SendEmail] Error al enviar correo:");

    if (err.response?.body) {
      console.error("🔍 Body del Error:", err.response.body);
    }

    if (err.code) {
      console.error("🔍 Código de Error:", err.code);
    }

    if (err.message) {
      console.error("🔍 Mensaje:", err.message);
    }

    throw new Error("Failed to send email with SendGrid");
  }
};
