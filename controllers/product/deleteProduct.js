const Product = require("../../models/productModel");

const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Kiểm tra userId có tồn tại
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Tìm user cần xóa
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không tồn tại",
      });
    }

    // Xóa user
    await Product.findByIdAndDelete(productId);

    // Trả về response JSON
    return res.status(200).json({
      success: true,
      message: "Xóa sản phẩm thành công",
      data: {
        deletedProductId: productId,
        deletedProductName: product.name,
      },
    });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa sản phẩm",
      error: error.message,
    });
  }
};

module.exports = deleteProduct;
