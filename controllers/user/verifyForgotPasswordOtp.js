const User = require("../../models/userModel");

const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email,
      forgot_password_otp: otp,
      forgot_password_expiry: { $gt: new Date() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "OTP không hợp lệ hoặc đã hết hạn." });
    }

    user.forgot_password_otp = null;
    user.forgot_password_expiry = null;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Xác thực OTP thành công." });
  } catch (error) {
    return res.status(500).json({ message: "Đã xảy ra lỗi máy chủ.", error });
  }
};

module.exports = verifyForgotPasswordOtp;
