const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendMail(to, subject, text) {
  return transporter.sendMail({
    from: `"Auro Haze" <${process.env.MAIL_USER}>`,
    to,
    subject,
    text,
  });
}

module.exports = { sendMail };

