const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Review = require("../models/Review");

// /api/products/frontend/:frontendId
router.get("/frontend/:frontendId", async (req, res) => {
  try {
    const frontendId = Number(req.params.frontendId);
    const product = await Product.findOne({ frontendId }).lean();
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const reviews = await Review.find({ product: product._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Ortalama rating
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      product.ratingAvg = sum / reviews.length;
      product.ratingCount = reviews.length;
    } else {
      product.ratingAvg = 0;
      product.ratingCount = 0;
    }

    res.json({ product, reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
