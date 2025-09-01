const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Vui lòng nhập email hợp lệ']
    },
    password: { type: String, default: null }, // Mặc định null cho đăng nhập Google
    profilePic: { type: String, default: null }, // Avatar upload
    avatar: { type: String, default: null }, // Avatar từ Google
    role: { type: String, default: "GENERAL", enum: ["GENERAL", "ADMIN"] },
    googleId: { type: String, unique: true, sparse: true },

    forgot_password_otp: { type: String, default: null },
    forgot_password_expiry: { type: Date, default: null },
    signup_otp: { type: String, default: null }, // Thêm trường này
    signup_otp_expiry: { type: Date, default: null },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Thêm index cho email
userSchema.index({ email: 1 }, { unique: true });

// Hook mã hóa mật khẩu (nếu cần)
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const bcrypt = require('bcrypt');
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;