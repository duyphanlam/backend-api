// backend/middleware/requireVerification.js
const userModel = require("../models/userModel");

async function requireVerification(req, res, next) {
  try {
    const userId = req.userId; // Lấy từ authToken middleware
    
    if (!userId) {
      return res.status(401).json({
        message: "Vui lòng đăng nhập",
        error: true,
        success: false
      });
    }

    const user = await userModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy tài khoản",
        error: true,
        success: false
      });
    }

    // ✅ KIỂM TRA: Tài khoản đã xác thực OTP chưa
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Vui lòng xác thực tài khoản trước khi sử dụng tính năng này",
        error: true,
        success: false,
        requireOtpVerification: true, // Flag để frontend biết
        email: user.email
      });
    }

    next(); // Cho phép tiếp tục
  } catch (err) {
    res.status(500).json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
}

module.exports = requireVerification;