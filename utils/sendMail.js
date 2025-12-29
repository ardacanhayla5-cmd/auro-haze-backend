const axios = require("axios");

async function sendMail(to, subject, text) {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Auro Haze",
          email: process.env.MAIL_USER,
        },
        to: [{ email: to }],
        subject,
        textContent: text,
      },
      {
        headers: {
          "api-key": process.env.MAIL_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("MAIL BAŞARILI:", response.data);
    return response.data;
  } catch (err) {
    console.error("MAIL HATA:", err.response?.data || err.message);
    throw err;
  }
}

module.exports = { sendMail };
