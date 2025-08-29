const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: { type: String }, // có thể để trống khi đăng nhập Google
    profilePic: { type: String }, // avatar do user upload
    avatar: { type: String }, // avatar từ Google
    role: { type: String, default: "GENERAL" },
    googleId: { type: String }, // id duy nhất của Google

    forgot_password_otp: {
      type: String,
      default: null,
    },
    forgot_password_expiry: {
      type: Date,
      default: null,
    },
    signup_otp_expiry: {
      type: Date,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
