const nodemailer = require("nodemailer");

async function sendMail(to, subject, text) {
  console.log("Mail config:", process.env.MAIL_HOST, process.env.MAIL_USER);

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000, // 10sn
  });

  return transporter.sendMail({
    from: `"Auro Haze" <${process.env.MAIL_USER}>`,
    to,
    subject,
    text,
  });
}

module.exports = { sendMail };
