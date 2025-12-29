const nodemailer = require("nodemailer");

async function sendMail(to, subject, text) {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  return transporter.sendMail({
    from: `"Auro Haze" <${process.env.MAIL_USER}>`,
    to,
    subject,
    text,
  });
}

module.exports = { sendMail };

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false, 
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

