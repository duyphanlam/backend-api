const bcrypt = require("bcryptjs");
const userModel = require("../../models/userModel");
const jwt = require("jsonwebtoken");

async function userSignInController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Vui lòng nhập email", success: false });
    }
    if (!password) {
      return res.status(400).json({ message: "Vui lòng nhập mật khẩu", success: false });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email không tồn tại", success: false });
    }

    const checkPassword = await bcrypt.compare(password, user.password || "");
    if (!checkPassword) {
      return res.status(401).json({ message: "Mật khẩu không chính xác", success: false });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Tài khoản chưa được xác thực. Vui lòng kiểm tra email và nhập OTP.",
        error: true,
        success: false,
        requireOtpVerification: true,
        email: user.email,
        name: user.name,
      });
    }

    const tokenData = { _id: user._id, email: user.email, role: user.role };
    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, { expiresIn: 60 * 60 * 8 });

    const tokenOption = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true chỉ trên production
      sameSite: process.env.NODE_ENV === "production" ? "None" : "lax", // None với HTTPS
      // Xóa domain: ".onrender.com", để mặc định (cookie áp dụng cho domain hiện tại)
    };

    const userResponse = user.toObject();
    delete userResponse.password;

    res.cookie("token", token, tokenOption).status(200).json({
      message: "Đăng nhập thành công",
      success: true,
      error: false,
      data: { token, user: userResponse },
    });
  } catch (err) {
    console.error("SignIn Error:", err);
    res.status(500).json({
      message: err.message || "Đã xảy ra lỗi",
      success: false,
    });
  }
}

module.exports = userSignInController;