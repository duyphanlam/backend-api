const userModel = require("../../models/userModel");

async function verifySignupOtpController(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Vui lòng nhập email và OTP",
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
        message: "Tài khoản đã được xác thực trước đó",
      });
    }

    // ✅ SỬA: Sử dụng signup_otp thay vì otp
    if (user.signup_otp !== Number(otp)) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "OTP không chính xác",
      });
    }

    // ✅ SỬA: Sử dụng signup_otp_expiry thay vì otpExpires
    if (user.signup_otp_expiry < Date.now()) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "OTP đã hết hạn, vui lòng đăng ký lại",
      });
    }

    // Xác thực thành công
    user.isVerified = true;
    user.signup_otp = null;              // ✅ SỬA: Sử dụng signup_otp
    user.signup_otp_expiry = null;       // ✅ SỬA: Sử dụng signup_otp_expiry
    await user.save();

    return res.json({
      success: true,
      error: false,
      message: "Xác thực tài khoản thành công!",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    res.json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
}

module.exports =  verifySignupOtpController ;