/***********************
 *  AURO HAZE SERVER
 ***********************/

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const passport = require("passport");
const { sendMail } = require("./utils/sendMail");

const app = express();

/* ======================
   CONFIG
====================== */
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "auro_haze_secret";

/* ======================
   MIDDLEWARE
====================== */
app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: "auro_haze_session",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* ======================
   STATIC FILES
====================== */
app.use(express.static(path.join(__dirname, "../frontend")));

/* ======================
   MONGODB
====================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB bağlandı"))
  .catch((err) => console.log("MongoDB hata:", err.message));

/* ======================
   MODELS
====================== */
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  passwordHash: String,
  name: String,
  surname: String,
  phone: String,
  birthDate: String,
  favorites: [String],
});
const User = mongoose.model("User", UserSchema);

/* ======================
   DROP MODELLER
====================== */
const ProductDetailSchema = new mongoose.Schema({
  frontendId: { type: Number, unique: true },
  name: String,
  subtitle: String,
  price: Number,
  currency: { type: String, default: "₺" },
  images: [String],
  description: String,
  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
});
const ProductDetail = mongoose.model("ProductDetail", ProductDetailSchema);

const ReviewSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductDetail" },
    name: String,
    rating: Number,
    comment: String,
  },
  { timestamps: true }
);
const Review = mongoose.model("Review", ReviewSchema);

const PreorderSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductDetail" },
    frontendId: Number,
    size: String,
    quantity: Number,
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);
const Preorder = mongoose.model("Preorder", PreorderSchema);

/* ======================
   AUTH MIDDLEWARE
====================== */
function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: "Token yok" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token geçersiz" });
  }
}

/* ======================
   ROUTES
====================== */
app.get("/", (_req, res) => {
  res.json({ status: "Backend OK" });
});

app.get("/test", async (req, res) => {
  try {
    await sendMail(
      "info@aurohaze.com",
      "Auro Haze Test",
      "Bu test mailidir"
    );
    res.json({ message: "Başarılı" });
  } catch (err) {
    console.error("MAIL HATA:", err.message);
    res.status(500).json({ error: "Mail gönderilemedi", detail: err.message });
  }
});


/* ======================
   START
====================== */
app.listen(PORT, () => {
  console.log(`Server çalışıyor! Port: ${PORT}`);
});
