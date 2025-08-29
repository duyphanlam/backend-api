const userModel = require("../../models/userModel");

async function userDetailsController(req, res) {
  try {
    console.log("userId", req.userId);
    if (!req.userId) {  // Thêm check từ middleware
      return res.status(400).json({
        message: "Không có ID người dùng",
        error: true,
        success: false,
      });
    }

    const user = await userModel.findById(req.userId);
    if (!user) {  // Thêm check user tồn tại
      return res.status(404).json({
        message: "Người dùng không tồn tại",
        error: true,
        success: false,
      });
    }

    res.status(200).json({
      data: user,
      error: false,
      success: true,
      message: "Thông tin người dùng",
    });

    console.log("user", user);
  } catch (err) {
    console.error("Controller error:", err);  // Log chi tiết
    res.status(500).json({  // Đổi thành 500 cho server error
      message: err.message || "Lỗi server",
      error: true,
      success: false,
    });
  }
}

module.exports = userDetailsController;