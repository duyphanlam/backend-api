const productModel = require("../../models/productModel");

// --- CÁC HÀM LOGIC CỦA BỘ NÃO MỚI ---

const handleGreeting = () => {
  return {
    type: "quick_reply",
    message:
      "Chào mừng quý khách đến với PHD Computer! Quý khách đang tìm kiếm sản phẩm nào ạ?",
    options: [
      "Laptop Dell",
      "Laptop HP",
      "Laptop Asus",
      "Laptop Gaming",
      "MacBook",
    ],
  };
};

// --- HÀM TÌM KIẾM PHIÊN BẢN PRO GAMER (DÙNG TEXT SEARCH) ---
const handleProductSearch = async (query) => {
  const stopWords = [
    "à",
    "ạ",
    "cho",
    "có",
    "của",
    "cần",
    "cái",
    "các",
    "chứ",
    "chưa",
    "chắc",
    "chỉ",
    "chiếc",
    "cũng",
    "con",
    "đây",
    "đó",
    "đang",
    "đéo",
    "được",
    "em",
    "gì",
    "giá",
    "giúp",
    "hay",
    "hỏi",
    "không",
    "là",
    "làm",
    "loại",
    "liệu",
    "mình",
    "mà",
    "mẫu",
    "mua",
    "muốn",
    "nào",
    "nên",
    "nếu",
    "như",
    "những",
    "nhiêu",
    "ơi",
    "phải",
    "qua",
    "ra",
    "rồi",
    "shop",
    "sao",
    "thì",
    "thấy",
    "thế",
    "tôi",
    "tìm",
    "tư",
    "vấn",
    "về",
    "với",
    "và",
    "vậy",
    "xem",
    "xin",
    "ad",
    "biết",
    "cấu",
    "hình",
    "thông",
    "số",
  ];

  const keywords = query
    .toLowerCase()
    .split(" ")
    .filter((word) => !stopWords.includes(word) && word.length > 0);
  const searchString = keywords.join(" ");

  if (!searchString) {
    return {
      type: "suggestion",
      message:
        "Rất tiếc, shop chưa hiểu rõ yêu cầu của quý khách. Quý khách có muốn trò chuyện trực tiếp với nhân viên tư vấn không ạ?",
    };
  }

  // SỬ DỤNG VŨ KHÍ HỦY DIỆT: MongoDB Text Search
  const products = await productModel
    .find(
      { $text: { $search: searchString } },
      { score: { $meta: "textScore" } } // Thêm điểm liên quan để xếp hạng
    )
    .sort({ score: { $meta: "textScore" } }) // Sắp xếp theo độ liên quan
    .limit(5)
    .lean();

  if (products.length > 0) {
    return {
      type: "product_list",
      data: products.map((p) => ({
        _id: p._id,
        name: p.productName,
        price: p.sellingPrice,
        image: p.productImage[0],
      })),
      message: `Dạ, đây là những sản phẩm liên quan nhất tới "${searchString}" mà shop tìm thấy:`,
    };
  } else {
    return {
      type: "suggestion",
      message: `Rất tiếc, shop không tìm thấy sản phẩm nào phù hợp với từ khóa "${searchString}". Quý khách có muốn trò chuyện trực tiếp với nhân viên tư vấn không ạ?`,
    };
  }
};

const handleSpecificQuestion = async (message, productId) => {
  const product = await productModel.findById(productId).lean();
  if (!product)
    return {
      type: "text",
      message: "Rất tiếc, tôi không tìm thấy thông tin sản phẩm này.",
    };

  const lowerMessage = message.toLowerCase();
  let reply = "";
  const keywordMap = {
    "màn hình": product.Display,
    cpu: product.CPU,
    chip: product.CPU,
    "vi xử lý": product.CPU,
    ram: product.Memory,
    "bộ nhớ": product.Memory,
    "ổ cứng": product.SSD,
    ssd: product.SSD,
    "card đồ họa": product.VGA,
    vga: product.VGA,
    "card màn hình": product.VGA,
    pin: product.Battery,
    "hệ điều hành": product.OS,
    os: product.OS,
    "cân nặng": product.Weight,
    nặng: product.Weight,
    "bảo hành": product.Warranty,
    màu: product.Color,
    "kết nối không dây": product.Wireless,
    wifi: product.Wireless,
    "cổng lan": product.LAN,
    "tình trạng": product.TinhTrang,
    "cảm ứng": product.Touch,
  };

  for (const keyword in keywordMap) {
    if (lowerMessage.includes(keyword)) {
      const value = keywordMap[keyword];
      if (value) {
        reply = `Dạ, mẫu ${product.productName} có thông số "${keyword}" là: ${value} ạ.`;
      } else {
        reply = `Dạ, shop chưa cập nhật thông tin về "${keyword}" cho sản phẩm này. Quý khách có cần thêm thông tin gì khác không ạ?`;
      }
      break;
    }
  }

  if (!reply) {
    if (
      lowerMessage.includes("cấu hình") ||
      lowerMessage.includes("thông số")
    ) {
      reply = `Dạ, đây là một vài thông số chính của ${product.productName}:\n- CPU: ${product.CPU}\n- RAM: ${product.Memory}\n- Ổ cứng: ${product.SSD}\n- Màn hình: ${product.Display}. Quý khách cần hỏi chi tiết về thông số nào ạ?`;
    } else {
      reply =
        "Dạ, quý khách có thể hỏi rõ hơn về thông số sản phẩm được không ạ? (VD: CPU, RAM, màn hình,...)";
    }
  }
  return { type: "text", message: reply };
};

// --- BỘ ĐIỀU KHIỂN TRUNG TÂM ---
const getBotResponse = async (req, res) => {
  try {
    const { message, productId } = req.body;
    if (!message) return res.status(400).json({ message: "Thiếu tin nhắn" });

    const lowerMessage = message.toLowerCase().trim();
    const greetingKeywords = ["xin chào", "chào shop", "alo", "hello", "hi"];

    if (greetingKeywords.includes(lowerMessage)) {
      res.json(handleGreeting());
    } else if (productId) {
      res.json(await handleSpecificQuestion(lowerMessage, productId));
    } else {
      res.json(await handleProductSearch(message));
    }
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Bot đang bận đi vệ sinh, alo admin!",
        error: err.message,
      });
  }
};

module.exports = getBotResponse;
