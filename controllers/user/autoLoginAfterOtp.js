// backend/controllers/user/autoLoginAfterOtp.js
const userModel = require("../../models/userModel");
const jwt = require("jsonwebtoken");

async function autoLoginAfterOtpController(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      throw new Error("Email là bắt buộc");
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      throw new Error("Không tìm thấy tài khoản");
    }

    // Kiểm tra tài khoản đã được xác thực
    if (!user.isVerified) {
      throw new Error("Tài khoản chưa được xác thực");
    }

    // Tạo token
    const tokenData = {
      _id: user._id,
      email: user.email,
    };
    const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, {
      expiresIn: 60 * 60 * 8,
    });

    const tokenOption = {
      httpOnly: true,
      secure: true,
      sameSite: 'None'
    };

    res.cookie("token", token, tokenOption).status(200).json({
      message: "Đăng nhập thành công",
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePic: user.profilePic,
          isVerified: user.isVerified
        }
      },
      success: true,
      error: false,
    });
  } catch (err) {
    res.json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
}

module.exports = autoLoginAfterOtpController;