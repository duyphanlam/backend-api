const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "product", // hoặc không cần populate product thì có thể bỏ
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user", // Quan trọng: phải giống y chang tên model "user"
    },
    rating: Number,
    comment: String,
  },
  {
    timestamps: true,
  }
);

const ratingModel = mongoose.model("rating", ratingSchema);

module.exports = ratingModel;
