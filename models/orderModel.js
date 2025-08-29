const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  productDetails: [
    {
      productId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      image: [String],
    },
  ],
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  totalAmount: { type: Number, required: true },

  shipping_options: [
    {
      shipping_rate: { type: String, default: "standard" },
      shipping_amount: { type: Number, default: 20000 },
    },
  ],

  // ✅ Trạng thái vận chuyển
  shippingStatus: { type: String, default: "Chuẩn bị hàng" },

  // ✅ Trạng thái thanh toán chỉ lưu ở đây
  paymentDetails: {
    payment_method_type: { type: [String], default: ["COD"] },
    status: { type: String, default: "Chờ thanh toán" },
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
