const UserModel = require('../models/userModel');
const bcryptjs = require('bcryptjs');
const sendEmail = require('../config/sendEmail');

const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

// ✅ Gửi OTP cho tất cả user (broadcast)
const sendOtpToAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find({}, 'email');
    if (!users.length) {
      return res.status(404).json({ success: false, message: 'Không có email nào trong hệ thống' });
    }

    const otp = generateOtp();
    const otpHash = await bcryptjs.hash(String(otp), 10);
    req.session.otpHash = otpHash;

    const emailList = users.map(u => u.email);

    await sendEmail({
      sendTo: emailList,
      subject: 'Mã OTP xác thực',
      html: `<p>Mã OTP của bạn là: <b>${otp}</b></p>`
    });

    res.json({ success: true, message: 'OTP đã gửi đến tất cả email đã đăng ký' });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    res.status(500).json({ success: false, message: 'Lỗi khi gửi OTP' });
  }
};

// ✅ Gửi OTP cho 1 email cụ thể
const sendOtpToOneUser = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email là bắt buộc" });

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "Email không tồn tại trong hệ thống" });

    const otp = generateOtp();
    const otpHash = await bcryptjs.hash(String(otp), 10);
    req.session.otpHash = otpHash;

    await sendEmail({
      sendTo: email,
      subject: "Mã OTP xác thực",
      html: `<p>Mã OTP của bạn là: <b>${otp}</b></p>`
    });

    res.json({ success: true, message: "OTP đã gửi thành công", email });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    res.status(500).json({ success: false, message: "Lỗi khi gửi OTP" });
  }
};

module.exports = { sendOtpToAllUsers, sendOtpToOneUser };
