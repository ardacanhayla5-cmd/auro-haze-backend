require("dotenv").config();
const mongoose = require("mongoose");
const ProductDetail = require("./server").models.ProductDetail;

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  await ProductDetail.deleteMany();

  await ProductDetail.insertMany([
    {
      frontendId: 1,
      name: "Bordo Edition",
      subtitle: "Oversize Fit • Unisex",
      price: 1199,
      images: [
        "img/bordo-on.png",
        "img/bordo-arka.png"
      ],
      description: "Premium oversize hoodie"
    },
    {
      frontendId: 2,
      name: "Zamansız Görünüş",
      subtitle: "Oversize Beyaz • Kırmızı Yazı",
      price: 1199,
      images: [
        "img/beyaz-on.png",
        "img/beyaz-arka.png"
      ],
      description: "Minimal görünüm"
    }
  ]);

  console.log("Seed tamamlandı.");
  process.exit();
}

seed();
