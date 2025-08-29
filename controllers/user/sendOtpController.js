const otpModel = require("../../models/otpModel");
const userModel = require("../../models/userModel");
const sendEmail = require("../../utils/sendEmail"); // hàm dùng SendGrid gửi mail

async function sendOtpController(req, res) {
  try {
    const { email, password, confirmPassword, name } = req.body;

    if (!email || !password || !confirmPassword || !name) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Mật khẩu nhập lại không khớp" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email đã được sử dụng" });
    }

    // Tạo mã OTP 6 số
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu OTP tạm
    await otpModel.create({ email, otp: otpCode });

    // Gửi mail OTP
    await sendEmail(email, "Xác thực tài khoản", `Mã OTP của bạn là: ${otpCode}`);

    res.status(200).json({
      success: true,
      message: "Mã OTP đã gửi đến email, vui lòng kiểm tra hộp thư",
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = sendOtpController;
