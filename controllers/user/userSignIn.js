const bcrypt = require("bcryptjs");
const userModel = require("../../models/userModel");
const jwt = require("jsonwebtoken");

async function userSignInController(req, res) {
  try {
    const { email, password } = req.body;

    // Kiểm tra input
    if (!email) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập email", success: false });
    }
    if (!password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập mật khẩu", success: false });
    }

    // Tìm user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email không tồn tại", success: false });
    }

    // So sánh mật khẩu
    const checkPassword = await bcrypt.compare(password, user.password || "");
    if (!checkPassword) {
      return res
        .status(401)
        .json({ message: "Mật khẩu không chính xác", success: false });
    }

    // ✅ KIỂM TRA: Tài khoản đã xác thực OTP chưa
    if (!user.isVerified) {
      return res.status(403).json({
        message:
          "Tài khoản chưa được xác thực. Vui lòng kiểm tra email và nhập OTP.",
        error: true,
        success: false,
        requireOtpVerification: true, // Flag để frontend biết
        email: user.email,
        name: user.name,
      });
    }

    // Tạo JWT token
    const tokenData = {
      _id: user._id,
      email: user.email,
      role: user.role,
    };
    const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, {
      expiresIn: 60 * 60 * 8, // 8h
    });

    // Cookie options
    const tokenOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None", // Hỗ trợ CORS
      domain: ".onrender.com", // Thêm dòng này
    };

    // Xóa password trước khi trả về
    const userResponse = user.toObject();
    delete userResponse.password;

    // Trả response
    res
      .cookie("token", token, tokenOption)
      .status(200)
      .json({
        message: "Đăng nhập thành công",
        success: true,
        error: false,
        data: {
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePic: user.profilePic,
            isVerified: user.isVerified,
          },
        },
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
