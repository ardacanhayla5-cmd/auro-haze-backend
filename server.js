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
const GoogleStrategy = require("passport-google-oauth20").Strategy;
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
   DROP ÜRÜN MODELLERİ
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

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  img: String,
});
const Product = mongoose.model("Product", ProductSchema);

/* ======================
   PASSPORT GOOGLE
====================== */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            email,
            passwordHash: "GOOGLE_AUTH",
            favorites: [],
          });
        }

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

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
   AUTH ROUTES
====================== */
app.post("/api/auth/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Eksik bilgi" });

  if (await User.findOne({ email }))
    return res.status(409).json({ error: "Email kayıtlı" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, favorites: [] });

  const token = jwt.sign({ id: user._id, email }, JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ token, email });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(401).json({ error: "Hatalı giriş" });
  if (user.passwordHash === "GOOGLE_AUTH")
    return res.status(400).json({ error: "Google ile giriş yap" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Hatalı giriş" });

  const token = jwt.sign({ id: user._id, email }, JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ token, email });
});

/* ======================
   GOOGLE AUTH
====================== */
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.redirect(`/account.html?token=${token}`);
  }
);

/* ======================
   USER
====================== */
app.get("/api/user/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "email name surname phone birthDate favorites"
  );
  res.json(user);
});

app.put("/api/user/update", auth, async (req, res) => {
  const { name, surname, phone, birthDate } = req.body;

  await User.findByIdAndUpdate(req.user.id, {
    name,
    surname,
    phone,
    birthDate,
  });

  res.json({ success: true });
});

app.put("/api/user/change-password", auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok)
    return res.status(400).json({ error: "Mevcut şifre yanlış" });

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ success: true });
});

/* ======================
   PRODUCTS / DROP SYSTEM
====================== */
app.get("/api/products", async (req, res) => {
  res.json(await Product.find());
});

app.get("/api/product/:frontendId", async (req, res) => {
  const product = await ProductDetail.findOne({ frontendId: Number(req.params.frontendId) }).lean();
  if (!product) return res.status(404).json({ error: "Ürün bulunamadı" });

  const reviews = await Review.find({ productId: product._id })
    .sort({ createdAt: -1 })
    .lean();

  res.json({ product, reviews });
});

app.post("/api/review", async (req, res) => {
  const { productId, name, rating, comment } = req.body;
  if (!productId || !name || !rating || !comment)
    return res.status(400).json({ error: "Eksik bilgi" });

  await Review.create({ productId, name, rating, comment });

  const stats = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: "$productId", avg: { $avg: "$rating" }, count: { $sum: 1 } } }
  ]);

  if (stats.length > 0) {
    await ProductDetail.findByIdAndUpdate(productId, {
      ratingAvg: stats[0].avg,
      ratingCount: stats[0].count
    });
  }

  res.json({ success: true });
});

app.post("/api/preorder", async (req, res) => {
  const { productId, frontendId, size, quantity } = req.body;

  if (!productId || !size)
    return res.status(400).json({ error: "Ürün veya beden eksik" });

  await Preorder.create({
    productId,
    frontendId,
    size,
    quantity: quantity || 1,
  });

  res.json({ success: true });
});

/* ======================
   TEST ROUTES
====================== */
app.get("/test", async (req, res) => {
  try {
    await sendMail(
      "seninmailin@gmail.com",
      "Auro Haze Test Mail",
      "Bu bir test mailidir. Backend mail gönderiyor ✅"
    );

    res.json({ message: "Backend OK ve Mail Gönderildi!" });
  } catch (err) {
    console.error("MAIL HATA:", err.message);
    res.status(500).json({ error: "Mail gönderilemedi" });
  }
});


/* ======================
   START SERVER
====================== */
app.listen(PORT, () =>
  console.log(`Server çalışıyor → http://localhost:${PORT}`)
);
