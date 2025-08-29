// controllers/chat/deleteChatController.js
const ChatModel = require("../../models/chatModel");

const deleteChatController = async (req, res) => {
  try {
    const { id } = req.params; // lấy id từ URL

    if (!id) {
      return res.status(400).json({
        message: "Thiếu ID bình luận",
        error: true,
        success: false,
      });
    }

    const deletedChat = await ChatModel.findByIdAndDelete(id);

    if (!deletedChat) {
      return res.status(404).json({
        message: "Không tìm thấy bình luận",
        error: true,
        success: false,
      });
    }

    res.json({
      message: "Xoá bình luận thành công",
      success: true,
      error: false,
      deletedChat,
    });
  } catch (err) {
    console.error("❌ Lỗi deleteChatController:", err);
    res.status(500).json({
      message: err.message || "Lỗi server",
      error: true,
      success: false,
    });
  }
};

module.exports = deleteChatController;
