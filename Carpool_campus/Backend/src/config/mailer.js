const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendOtpEmail(to, otp, purpose) {
  const subject =
    purpose === 'password_reset'
      ? 'CarpoolCampus — Password Reset Code'
      : 'CarpoolCampus — Verify Your Email';

  const html = `
    <p>Hi,</p>
    <p>Your CarpoolCampus one-time code is:</p>
    <h2 style="letter-spacing:4px;">${otp}</h2>
    <p>This code expires in ${Math.round((process.env.OTP_TTL_SECONDS || 600) / 60)} minutes. If you didn't request this, you can ignore this email.</p>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}

module.exports = { transporter, sendOtpEmail };
