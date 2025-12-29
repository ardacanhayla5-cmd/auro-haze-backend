const mongoose = require("mongoose");
const { Schema } = mongoose;

const preorderSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    frontendId: Number,
    size: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    name: String,
    email: String,
    phone: String,
    note: String,
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Preorder", preorderSchema);
