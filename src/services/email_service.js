import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user: "areascript22@gmail.com", pass: "jvli psbd vwwv lmyp" },
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const sendEmail = async (to, subject, text) => {
  await wait(350);

  const mailOptions = {
    from: `"ReadMind AI App" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email successfully sent:", info.response);
    return info;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    throw error;
  }
};
