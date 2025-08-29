const mongoose = require("mongoose");
const Chat = require("../../models/chatModel");

const getMessages = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "productId không hợp lệ" });
    }

    const messages = await Chat.find({ productId })
      .populate("userId", "name profilePic role")
      .populate({
        path: "replyTo",
        select: "message userId",
        populate: { path: "userId", select: "name" },
      })
      .sort({ createdAt: 1 }); // Sort asc để build tree đúng

    res.json({ success: true, data: messages });
  } catch (err) {
    console.error("Error in getMessages:", err.stack);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy tin nhắn",
      error: err.message,
    });
  }
};

module.exports = getMessages;
