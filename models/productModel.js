const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    productName: String,
    brandName: String,
    category: String,
    productImage: [String], // Đảm bảo productImage là mảng các chuỗi
    description: String,
    price: Number,
    sellingPrice: Number,
    CPU: String,
    Memory: String,
    SSD: String,
    VGA: String,
    Display: String,
    Touch: String,
    Wireless: String,
    LAN: String,
    Battery: String,
    OS: String,
    Weight: String,
    Color: String,
    Warranty: String,
    Option: String,
    TinhTrang: String,
  },
  {
    timestamps: true,
  }
);

// Thêm text index để tối ưu tìm kiếm (không ảnh hưởng đến logic cũ)
productSchema.index({
  productName: "text",
  category: "text",
  description: "text",
  brandName: "text",
  CPU: "text",
  VGA: "text",
});

// Thêm compound indexes để tăng hiệu suất query
productSchema.index({ category: 1, sellingPrice: 1 });
productSchema.index({ sellingPrice: 1 });
productSchema.index({ createdAt: -1 });

const productModel = mongoose.model("product", productSchema);

module.exports = productModel;
