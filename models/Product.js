const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    frontendId: { type: Number, required: true, unique: true }, // index.html'deki id
    name: { type: String, required: true },
    subtitle: String,
    price: { type: Number, required: true },
    currency: { type: String, default: "₺" },
    images: [String],
    description: String,
    sizes: { type: [String], default: ["S", "M", "L", "XL"] },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
