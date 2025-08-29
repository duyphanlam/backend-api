const mongoose = require("mongoose");
const Chat = require("../../models/chatModel");

const sendMessage = async (req, res) => {
  try {
    const { productId } = req.params;
    const { message, replyTo } = req.body; // replyTo optional
    const userId = req.userId;
    const isAdmin = req.userRole === "admin";

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "productId không hợp lệ" });
    }

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Yêu cầu đăng nhập" });
    }

    if (!message?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Tin nhắn không được để trống" });
    }

    if (replyTo && !mongoose.Types.ObjectId.isValid(replyTo)) {
      return res
        .status(400)
        .json({ success: false, message: "replyTo không hợp lệ" });
    }

    const newMessage = await Chat.create({
      productId,
      userId,
      message: message.trim(),
      isAdmin,
      replyTo: replyTo || null,
    });

    // Populate (không dùng execPopulate - deprecated)
    await newMessage.populate("userId", "name role");

    // Check req.io trước emit
    if (req.io) {
      req.io.to(productId).emit("newMessage", {
        ...newMessage.toObject(),
        userId: {
          _id: userId,
          name: req.userName || "Ẩn danh",
          role: req.userRole || "user",
        },
      });
    } else {
      console.warn("Socket.io not attached to req");
    }

    res.json({ success: true, data: newMessage });
  } catch (err) {
    console.error("Error in sendMessage:", err.stack);
    res.status(500).json({
      success: false,
      message: "Lỗi khi gửi tin nhắn",
      error: err.message,
    });
  }
};

module.exports = sendMessage;
