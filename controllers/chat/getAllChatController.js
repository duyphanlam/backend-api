const ChatModel = require("../../models/chatModel");

const getAllChatController = async (req, res) => {
  try {
    const allChat = await ChatModel.find()
      .populate({
        path: "productId",
        select: "productName", // ✅ đúng field trong productModel
      })
      .populate({
        path: "userId",
        select: "name email", // ✅ userModel phải có name, email
      })
      .sort({ createdAt: -1 });

    // Format lại cho dễ dùng ở frontend
    const formattedChats = allChat.map((chat) => ({
      _id: chat._id,
      productId: chat.productId?._id || null,
      productName: chat.productId?.productName || "Sản phẩm không xác định",
      userId: chat.userId?._id || null,
      userName: chat.userId?.name || "Người dùng không xác định",
      email: chat.userId?.email || "",
      message: chat.message,
      createdAt: chat.createdAt,
    }));

    console.log("📢 AllChat formatted:", formattedChats);

    res.json({
      message: "Tất cả chat",
      success: true,
      error: false,
      chats: formattedChats,
    });
  } catch (err) {
    console.error("❌ Lỗi getAllChatController:", err);
    res.status(400).json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
};

module.exports = getAllChatController;
