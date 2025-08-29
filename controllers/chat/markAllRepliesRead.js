const Chat = require("../../models/chatModel");

const markAllRepliesRead = async (req, res) => {
  try {
    const userId = req.userId;

    // Lấy tất cả reply gửi đến user đang đăng nhập
    const replies = await Chat.find({
      replyTo: { $ne: null },
    }).populate({
      path: "replyTo",
      select: "userId",
    });

    // Lọc ra những reply chưa đọc và gửi cho user hiện tại
    const targetIds = replies
      .filter(
        (r) =>
          r.replyTo?.userId?.toString() === userId.toString() &&
          r.isRead === false
      )
      .map((r) => r._id);

    if (targetIds.length > 0) {
      await Chat.updateMany(
        { _id: { $in: targetIds } },
        { $set: { isRead: true } }
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error in markAllRepliesRead:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = markAllRepliesRead;
