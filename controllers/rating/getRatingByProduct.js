// controllers/rating/getRatingByProduct.js
const Rating = require("../../models/ratingModel");

const getRatingsByProduct = async (req, res) => {
  try {
    const ratings = await Rating.find({ productId: req.params.productId })
      .populate("userId", "name") // populate lấy tên người dùng
      .sort({ createdAt: -1 });

    res.json({ data: ratings });
  } catch (err) {
    console.error("Lỗi khi lấy đánh giá:", err);
    res
      .status(500)
      .json({ message: "Lỗi khi lấy đánh giá", error: err.message });
  }
};

module.exports = getRatingsByProduct;
