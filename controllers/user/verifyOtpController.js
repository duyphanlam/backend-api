const otpModel = require("../../models/otpModel");
const userModel = require("../../models/userModel");
const bcrypt = require("bcryptjs");

async function verifyOtpController(req, res) {
  try {
    const { email, otp, password, name } = req.body;

    const otpRecord = await otpModel.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "OTP không hợp lệ hoặc đã hết hạn" });
    }

    // Hash mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Tạo user
    const newUser = new userModel({
      name,
      email,
      password: hashPassword,
      role: "GENERAL"
    });
    await newUser.save();

    // Xoá OTP sau khi dùng
    await otpModel.deleteMany({ email });

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công, bạn có thể đăng nhập",
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = verifyOtpController;
