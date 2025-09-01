const userModel = require("../../models/userModel");
const sendEmail = require("../../config/sendEmail");

async function resendSignupOtpController(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Vui lòng nhập email",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "Không tìm thấy tài khoản",
      });
    }

    if (user.isVerified) {
      return res.json({
        success: true,
        error: false,
        message: "Tài khoản đã được xác thực rồi",
      });
    }

    // Sinh OTP mới
    const newOtp = String(Math.floor(100000 + Math.random() * 900000));
    const newOtpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    // Cập nhật OTP mới vào database
    user.signup_otp = newOtp;
    user.signup_otp_expiry = newOtpExpires;
    await user.save();

    // Gửi OTP mới qua email
    await sendEmail({
      sendTo: email,
      subject: "Mã OTP mới - Xác thực tài khoản",
      html: `
        <h3>Xin chào ${user.name},</h3>
        <p>Mã OTP mới để xác thực tài khoản của bạn là:</p>
        <h1 style="color:blue; font-size: 32px; text-align: center; background: #f0f8ff; padding: 20px; border-radius: 8px;">${newOtp}</h1>
        <p><strong>OTP sẽ hết hạn trong 5 phút.</strong></p>
        <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Email tự động từ hệ thống</p>
      `,
    });

    return res.json({
      success: true,
      error: false,
      message: "OTP mới đã được gửi đến email của bạn",
    });
  } catch (err) {
    console.log("Lỗi resend signup OTP:", err);
    res.json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
}

module.exports = resendSignupOtpController;