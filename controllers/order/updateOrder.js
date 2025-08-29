const Order = require("../../models/orderModel");

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentDetails, shippingStatus } = req.body;

    const updateData = {};

    // Nếu có cập nhật trạng thái thanh toán
    if (paymentDetails?.status) {
      updateData["paymentDetails.status"] = paymentDetails.status;
    }

    // Nếu có cập nhật trạng thái vận chuyển
    if (shippingStatus) {
      updateData["shippingStatus"] = shippingStatus;
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
    });

    if (!updatedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    res.json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật đơn hàng",
    });
  }
};

module.exports = updateOrderStatus;
