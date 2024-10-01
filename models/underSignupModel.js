const mongoose = require("mongoose");

const underSignupSchema = new mongoose.Schema({
  phone: { type: String, default: "" },
  email: { type: String, default: "" },
  otp: { type: String, default: "" },
  password: {type: String, default: ""},
  userType: {type: String}
});

module.exports = mongoose.model("UnderSingup", underSignupSchema);
