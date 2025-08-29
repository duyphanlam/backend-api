const orderModel = require("../../models/orderModel");
const addToCartModel = require("../../models/cartProduct");

const webhooks = async (request, response) => {
  try {
    const {
      productDetails,
      email,
      userId,
      paymentDetails,
      shippingOptions,
      totalAmount,
    } = request.body;

    // Kiểm tra dữ liệu đầu vào
    if (!userId || !productDetails || !totalAmount) {
      return response.status(400).send("Dữ liệu yêu cầu không hợp lệ");
    }

    // Mặc định phương thức thanh toán là "Thanh toán khi nhận hàng" nếu không có giá trị
    const paymentMethod =
      paymentDetails?.payment_method_type?.[0] || "Thanh toán khi nhận hàng";
    const paymentStatus = paymentDetails?.payment_status || "Chờ thanh toán";

    const orderDetails = {
      productDetails: productDetails.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || [],
      })),
      email: email,
      userId: userId,
      paymentDetails: {
        payment_method_type: [paymentMethod], // Mảng để hỗ trợ nhiều phương thức trong tương lai
        payment_status: paymentStatus,
      },
      shipping_options:
        shippingOptions?.map((s) => ({
          ...s,
          shipping_amount: s.shipping_amount || 0, // Đảm bảo giá trị mặc định
        })) || [],
      totalAmount: totalAmount,
    };

    // Lưu đơn hàng
    const order = new orderModel(orderDetails);
    const saveOrder = await order.save();

    if (saveOrder?._id) {
      // Xóa giỏ hàng sau khi lưu đơn hàng thành công
      await addToCartModel.deleteMany({ userId: userId });
    }

    response.status(200).send("Đơn hàng đã được lưu thành công");
  } catch (error) {
    console.error("Lỗi khi xử lý đơn hàng:", error);
    response.status(500).send("Lỗi máy chủ nội bộ");
  }
};

module.exports = webhooks;
