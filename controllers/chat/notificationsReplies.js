const Chat = require("../../models/chatModel");

const notificationsReplies = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Yêu cầu đăng nhập",
      });
    }

    const replies = await Chat.find({
      replyTo: { $ne: null },
      isRead: false, // ✅ chỉ lấy chưa đọc
    })
      .populate({
        path: "replyTo",
        select: "message userId",
        populate: { path: "userId", select: "name" },
      })
      .populate("userId", "name profilePic")
      .sort({ createdAt: -1 });

    const filtered = replies.filter(
      (r) =>
        r.replyTo?.userId?._id?.toString() === userId.toString() &&
        r.userId?._id?.toString() !== userId.toString()
    );

    const result = filtered.map((r) => ({
      _id: r._id,
      senderId: r.userId._id,
      senderName: r.userId.name,
      senderPic: r.userId.profilePic,
      productId: r.productId,
      message: r.message,
      createdAt: r.createdAt,
      replyToMessage: r.replyTo?.message || "",
      isRead: r.isRead,
    }));

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("Error in notificationsReplies:", err.stack);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông báo trả lời",
      error: err.message,
    });
  }
};

module.exports = notificationsReplies;
