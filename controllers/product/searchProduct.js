const productModel = require("../../models/productModel");

const searchProduct = async (req, res) => {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      sort = "relevance",
      page = 1,
      limit = 12,
      brand,
    } = req.query;

    // Nếu không có query, trả về lỗi
    if (!q || q.trim().length === 0) {
      return res.json({
        data: [],
        message: "Từ khóa tìm kiếm không được để trống",
        error: true,
        success: false,
      });
    }

    const searchTerm = q.trim();
    console.log("Search term:", searchTerm); // Debug log

    // Tạo regex cho tìm kiếm - sử dụng regex đơn giản và hiệu quả
    const searchRegex = new RegExp(searchTerm, "i");
    const wordsRegex = new RegExp(searchTerm.split(/\s+/).join("|"), "i");

    // Build search query chính - tìm kiếm trong tất cả các trường có thể
    const searchQuery = {
      $or: [
        { productName: searchRegex },
        { brandName: searchRegex },
        { category: searchRegex },
        { description: searchRegex },
        { CPU: searchRegex },
        { Memory: searchRegex },
        { SSD: searchRegex },
        { VGA: searchRegex },
        { Display: searchRegex },
        { OS: searchRegex },
        { Color: searchRegex },
        // Tìm kiếm từng từ riêng lẻ
        { productName: wordsRegex },
        { brandName: wordsRegex },
        { category: wordsRegex },
      ],
    };

    // Thêm filter theo category nếu có
    if (category && category.trim() !== "") {
      searchQuery.category = { $regex: category, $options: "i" };
    }

    // Thêm filter theo brand nếu có
    if (brand && brand.trim() !== "") {
      searchQuery.brandName = { $regex: brand, $options: "i" };
    }

    // Thêm filter theo giá nếu có
    if (minPrice || maxPrice) {
      searchQuery.sellingPrice = {};
      if (minPrice) {
        searchQuery.sellingPrice.$gte = Number.parseInt(minPrice);
      }
      if (maxPrice) {
        searchQuery.sellingPrice.$lte = Number.parseInt(maxPrice);
      }
    }

    console.log("Search query:", JSON.stringify(searchQuery, null, 2)); // Debug log

    // Xử lý sort options
    let sortOptions = {};
    switch (sort) {
      case "price_asc":
        sortOptions = { sellingPrice: 1 };
        break;
      case "price_desc":
        sortOptions = { sellingPrice: -1 };
        break;
      case "name_asc":
        sortOptions = { productName: 1 };
        break;
      case "name_desc":
        sortOptions = { productName: -1 };
        break;
      case "brand_asc":
        sortOptions = { brandName: 1 };
        break;
      case "brand_desc":
        sortOptions = { brandName: -1 };
        break;
      case "newest":
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    // Tính toán phân trang
    const pageNum = Number.parseInt(page);
    const limitNum = Number.parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Thực hiện tìm kiếm
    const [products, totalCount] = await Promise.all([
      productModel
        .find(searchQuery)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      productModel.countDocuments(searchQuery),
    ]);

    console.log("Found products:", products.length); // Debug log

    // Tính điểm relevance cho từng sản phẩm (đơn giản hóa)
    const productsWithScore = products.map((product) => {
      let relevanceScore = 0;
      const productObj = product.toObject();
      const lowerSearchTerm = searchTerm.toLowerCase();

      // Tính điểm dựa trên độ khớp
      if (
        productObj.productName &&
        productObj.productName.toLowerCase().includes(lowerSearchTerm)
      ) {
        relevanceScore +=
          productObj.productName.toLowerCase() === lowerSearchTerm ? 20 : 10;
      }

      if (
        productObj.brandName &&
        productObj.brandName.toLowerCase().includes(lowerSearchTerm)
      ) {
        relevanceScore +=
          productObj.brandName.toLowerCase() === lowerSearchTerm ? 15 : 8;
      }

      if (
        productObj.category &&
        productObj.category.toLowerCase().includes(lowerSearchTerm)
      ) {
        relevanceScore +=
          productObj.category.toLowerCase() === lowerSearchTerm ? 12 : 6;
      }

      if (
        productObj.description &&
        productObj.description.toLowerCase().includes(lowerSearchTerm)
      ) {
        relevanceScore += 4;
      }

      // Tìm kiếm trong thông số kỹ thuật
      const techFields = ["CPU", "Memory", "SSD", "VGA", "Display", "OS"];
      techFields.forEach((field) => {
        if (
          productObj[field] &&
          productObj[field].toLowerCase().includes(lowerSearchTerm)
        ) {
          relevanceScore += 3;
        }
      });

      return {
        ...productObj,
        relevanceScore,
      };
    });

    // Sắp xếp theo relevance nếu sort = "relevance"
    if (sort === "relevance") {
      productsWithScore.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    // Trả về response theo format cũ
    res.json({
      data: productsWithScore,
      total: totalCount,
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
      hasPrevPage: pageNum > 1,
      message: "Tìm kiếm danh sách sản phẩm",
      error: false,
      success: true,
    });
  } catch (err) {
    console.error("Search error:", err); // Debug log
    res.json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
};

module.exports = searchProduct;
