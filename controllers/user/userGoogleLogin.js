const jwt = require("jsonwebtoken");
const User = require("../../models/userModel");

const userGoogleLogin = async (req, res) => {
  try {
    const { user, token } = req.user; // lấy từ passport (đã xử lý ở passport.js)

    // cấu hình cookie
    const tokenOption = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // bật secure khi chạy HTTPS
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    };

    // gắn token vào cookie
    res.cookie("token", token, tokenOption);

    // redirect về FE (không cần gắn token vào query string)
    res.redirect(`${process.env.FRONTEND_URL}/api/auth/login/success`);
  } catch (err) {
    console.error("Google Login Error:", err);
    res.redirect(
      `${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(
        err.message
      )}`
    );
  }
};

module.exports = userGoogleLogin;
