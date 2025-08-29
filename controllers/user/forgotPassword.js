const User = require("../../models/userModel");
const sendEmail = require("../../config/sendEmail");
const generateOtp = require("../../utils/generatedOtp");
const forgotPasswordTemplate = require("../../utils/forgotPasswordTemplate");

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email là bắt buộc" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    // tạo OTP 6 số (lưu dạng string cho chắc)
    const otp = String(generateOtp());

    // LƯU THEO SCHEMA CỦA BẠN
    user.forgot_password_otp = otp;
    user.forgot_password_expiry = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await user.save();

    const subject = "Yêu cầu đặt lại mật khẩu";
    const html = forgotPasswordTemplate({ name: user.name || "bạn", otp });

    // Debug để chắc chắn tham số đầy đủ
    console.log("DEBUG sendEmail params:", {
      sendTo: email,
      subject,
      htmlLength: html?.length,
    });

    // GỌI THEO ĐÚNG CHỮ KÝ HÀM sendEmail
    await sendEmail({ sendTo: email, subject, html });

    return res.status(200).json({
      success: true,
      message: "OTP đặt lại mật khẩu đã được gửi đến email của bạn.",
    });
  } catch (error) {
    console.error(
      "[FORGOT-PASSWORD][sendEmail error]:",
      error?.message || error
    );
    return res.status(500).json({
      message: "Đã xảy ra lỗi máy chủ.",
      error: error?.message || error,
    });
  }
};

module.exports = forgotPassword;
