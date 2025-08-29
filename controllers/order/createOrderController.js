const Order = require("../../models/orderModel");

const createOrderController = async (req, res) => {
  try {
    const {
      products,
      fullName,
      phone,
      address,
      note,
      totalAmount,
      shippingFee,
      paymentMethod,
    } = req.body;

    const userId = req.userId; // từ middleware

    // Kiểm tra sản phẩm có hợp lệ không
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không có sản phẩm nào trong đơn hàng.",
      });
    }

    const newOrder = new Order({
      userId,
      productDetails: products, // ✅ Đúng tên field như trong schema
      fullName,
      phone,
      address,
      note,
      totalAmount,
      shippingFee,
      paymentMethod,
    });

    await newOrder.save();

    res.json({
      success: true,
      message: "Đơn hàng đã được tạo thành công!",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = createOrderController;
