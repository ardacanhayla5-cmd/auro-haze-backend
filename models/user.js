const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  surname: String,
  phone: String,
  birthDate: String
});

module.exports = mongoose.model("User", UserSchema);
