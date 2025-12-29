const express = require("express");
const router = express.Router();
const Preorder = require("../models/Preorder");

router.post("/", async (req, res) => {
  try {
    const { productId, frontendId, size, quantity, name, email, phone, note } =
      req.body;

    if (!productId || !size) {
      return res.status(400).json({ message: "Ürün veya beden eksik" });
    }

    await Preorder.create({
      product: productId,
      frontendId,
      size,
      quantity: quantity || 1,
      name,
      email,
      phone,
      note,
    });

    res.status(201).json({ message: "Ön sipariş kaydedildi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

module.exports = router;
