const mongoose = require("mongoose");
const Rating = require("../../models/ratingModel");

const addRating = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, review } = req.body;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Điểm đánh giá phải từ 1 đến 5" });
    }

    // BỎ kiểm tra đã đánh giá chưa
    const newRating = new Rating({
      userId,
      productId,
      rating,
      review,
    });

    await newRating.save();

    res.json({ message: "Đánh giá thành công", data: newRating });
  } catch (err) {
    console.error("Lỗi khi đánh giá sản phẩm:", err);
    res.status(500).json({ message: "Lỗi khi đánh giá sản phẩm" });
  }
};

module.exports = addRating;
