import axios from "axios";

export async function sendSMS(phone, message) {
  try {
    await axios.get("https://api.netgsm.com.tr/sms/send/get", {
      params: {
        usercode: "NETGSM_KULLANICI_ADI",
        password: "NETGSM_SIFRE",
        gsmno: phone,
        message,
        msgheader: "AUROHAZE"
      }
    });
  } catch (err) {
    console.error("SMS gönderilemedi:", err.message);
  }
}
