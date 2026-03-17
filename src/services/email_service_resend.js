import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmailResend = async ({ to, subject, text, html }) => {

  if (!to || !subject || (!text && !html)) {
    console.error("❌ [SendEmail] Faltan parámetros obligatorios.");
    throw new Error("Missing parameters for sendEmail");
  }

  const msg = {
    to,
    from: process.env.MAIL_FROM,
    subject,
    text,
    html,
  };

  try {
    console.log("📤 [SendEmail] Enviando correo a SendGrid...");
    const response = await resend.emails.send(msg);


    return response;
  } catch (err) {
    console.error("❌ [SendEmail] Error sending email:");

    if (err.response?.body) {
      console.error("🔍 Body del Error:", err.response.body);
    }

    if (err.code) {
      console.error("🔍 Error code:", err.code);
    }

    if (err.message) {
      console.error("🔍 Message:", err.message);
    }

    throw new Error("Failed to send email with SendGrid");
  }
};