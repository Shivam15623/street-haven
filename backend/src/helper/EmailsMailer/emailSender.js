import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_HOST,
  port: process.env.BREVO_PORT,
  secure: false, // use TLS
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});
export const sendEmail = async ({ to, subject, html }) => {
  try {
    return await transporter.sendMail({
      from: "phenomenalshivam2@gmail.com",
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    throw new Error("Failed to send email");
  }
};
