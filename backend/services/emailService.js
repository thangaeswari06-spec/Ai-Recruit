import nodemailer from "nodemailer";

// Direct email sender for backend-triggered transactional mail (welcome email,
// password reset). n8n Workflows 1/2/3/5 send their own recruiting emails —
// this is only for account-level emails the backend owns.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export const emailService = {
  async send({ to, subject, text, html }) {
    return transporter.sendMail({
      from: process.env.SMTP_FROM || "AI Recruit <no-reply@airecruit.com>",
      to,
      subject,
      text,
      html,
    });
  },

  async sendWelcomeEmail(to, name) {
    return this.send({
      to,
      subject: "Welcome to AI Recruit",
      text: `Hi ${name}, your account is ready. Sign in to start posting jobs and screening candidates with AI.`,
    });
  },
};

export default emailService;