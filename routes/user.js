const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// AUTH
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Token yok" });

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: "Token geçersiz" });
  }
}

// PROFİL GET
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.userId).select("-password");
  res.json(user);
});

// PROFİL KAYDET
router.put("/update", auth, async (req, res) => {
  console.log("UPDATE BODY:", req.body);

  await User.findByIdAndUpdate(req.userId, {
    name: req.body.name,
    surname: req.body.surname,
    phone: req.body.phone,
    birthDate: req.body.birthDate
  });

  res.json({ success: true });
});

// ŞİFRE DEĞİŞTİR
router.put("/change-password", auth, async (req, res) => {
  console.log("CHANGE PASSWORD");

  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.userId);

  if (!user.password) {
    return res.json({ error: "Sosyal girişli hesap" });
  }

  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) {
    return res.json({ error: "Mevcut şifre yanlış" });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ success: true });
});

module.exports = router;
