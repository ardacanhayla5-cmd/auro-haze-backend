const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Product = require("../models/Product");

// Yorum ekleme
router.post("/", async (req, res) => {
  try {
    const { productId, name, rating, comment } = req.body;
    if (!productId || !name || !rating || !comment) {
      return res.status(400).json({ message: "Eksik alanlar var" });
    }

    await Review.create({
      product: productId,
      name,
      rating,
      comment,
    });

    // Rating ortalamasını güncelle
    const stats = await Review.aggregate([
      { $match: { product: require("mongoose").Types.ObjectId(productId) } },
      {
        $group: {
          _id: "$product",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length) {
      await Product.findByIdAndUpdate(productId, {
        ratingAvg: stats[0].avgRating,
        ratingCount: stats[0].count,
      });
    }

    return res.status(201).json({ message: "Yorum kaydedildi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

module.exports = router;
