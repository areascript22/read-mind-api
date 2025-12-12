import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "areascript22@gmail.com",
    pass: "rolt cmtq cxqv xamr",
  },
});

export const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: '"ReadMind AI" <areascript22@gmail.com>',
    replyTo: "areascript22@gmail.com",
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email successfully sent:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email to ", to, +": " + error);
    throw error;
  }
};
