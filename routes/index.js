const express = require("express");
const router = express.Router();

const userSignUpController = require("../controllers/user/userSignUp");
const userSignInController = require("../controllers/user/userSignIn");
const userDetailsController = require("../controllers/user/userDetails");
const authToken = require("../middleware/authToken");
const requireVerification = require("../middleware/requireVerification");
const userLogout = require("../controllers/user/userLogout");
const allUsers = require("../controllers/user/allUsers");
const updateUser = require("../controllers/user/updateUser");
const deleteUser = require("../controllers/user/deleteUser");
const UploadProductController = require("../controllers/product/uploadProduct");
const getProductController = require("../controllers/product/getProduct");
const updateProductController = require("../controllers/product/updateProduct");
const getCategoryProduct = require("../controllers/product/getCategoryProductOne");
const getCategoryWiseProduct = require("../controllers/product/getCategoryWiseProduct");
const deleteProduct = require("../controllers/product/deleteProduct");
const getProductDetails = require("../controllers/product/getProductDetails");
const addToCartController = require("../controllers/user/addToCartController");
const countAddToCartProduct = require("../controllers/user/countAddToCartProduct");
const addToCartViewProduct = require("../controllers/user/addToCartViewProduct");
const updateAddToCartProduct = require("../controllers/user/updateAddToCartProduct");
const deleteAddToCartProduct = require("../controllers/user/deleteAddToCartProduct");
const searchProduct = require("../controllers/product/searchProduct");
const filterProductController = require("../controllers/product/filterProduct");
const createOrder = require("../controllers/order/createOrderController");
const orderController = require("../controllers/order/order.controller");
const webhooks = require("../controllers/order/webhook");
const allOrderController = require("../controllers/order/allOrder.controller");
const updateOrderStatus = require("../controllers/order/updateOrder");
const addRating = require("../controllers/rating/ratingProduct");
const getRatingsByProduct = require("../controllers/rating/getRatingByProduct");
const getMessages = require("../controllers/chat/getMessage");
const sendMessage = require("../controllers/chat/sendMessage");
const notificationsReplies = require("../controllers/chat/notificationsReplies");
const markAllRepliesRead = require("../controllers/chat/markAllRepliesRead");
const getAllChatController = require("../controllers/chat/getAllChatController.js");
const deleteChatController = require("../controllers/chat/deleteChatController.js");
const forgotPasswordController = require("../controllers/user/forgotPassword");
const verifyForgotPasswordOtp = require("../controllers/user/verifyForgotPasswordOtp");
const resetPassword = require("../controllers/user/resetPassword");
const {
  sendOtpToAllUsers,
  sendOtpToOneUser,
} = require("../controllers/authController");
const {
  verifySignupOtpController,
} = require("../controllers/user/verifySignupOtpController");
const {
  resendSignupOtpController,
} = require("../controllers/user/resendSignupOtpController");
const autoLoginAfterOtpController = require("../controllers/user/autoLoginAfterOtp");
const passport = require("passport");
const userGoogleLogin = require("../controllers/user/userGoogleLogin");

// THÊM CONTROLLER CHO CHATBOT
const getBotResponse = require("../controllers/chatbot/getBotResponse");

// ========== Google OAuth ==========
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  userGoogleLogin
);

// Login Success cho FE gọi
router.get("/auth/login/success", (req, res) => {
  if (req.user) {
    return res.json({
      success: true,
      user: req.user.user,   // user từ passport
      token: req.user.token, // token JWT
    });
  } else {
    return res.json({ success: false });
  }
});

// Google Logout
router.get("/auth/logout", (req, res) => {
  req.logout(() => {
    res.clearCookie("token");
    res.redirect(`${process.env.FRONTEND_URL}/api/login`);
  });
});

// ========== Auth ==========
router.post("/signup", userSignUpController);
router.post("/signin", userSignInController);
router.post("/verify-signup-otp", verifySignupOtpController);
router.post("/resend-signup-otp", resendSignupOtpController);
router.post("/auto-login-after-otp", autoLoginAfterOtpController);

// User
router.get("/user-details", authToken, userDetailsController);
router.get("/userLogout", userLogout);
router.delete("/delete-user/:userId", authToken, deleteUser);
router.get("/all-user", authToken, allUsers);
router.post("/update-user", authToken, updateUser);

// Product
router.post("/upload-product", authToken, UploadProductController);
router.get("/get-product", getProductController);
router.post("/update-product", authToken, updateProductController);
router.get("/get-categoryProduct", getCategoryProduct);
router.post("/category-product", getCategoryWiseProduct);
router.post("/product-details", getProductDetails);
router.get("/search", searchProduct);
router.post("/filter-product", filterProductController);
router.delete("/delete-product/:productId", authToken, deleteProduct);

// Cart
router.post("/addtocart", authToken, addToCartController);
router.get("/countAddToCartProduct", authToken, countAddToCartProduct);
router.get("/view-cart-product", authToken, addToCartViewProduct);
router.post("/update-cart-product", authToken, updateAddToCartProduct);
router.post("/delete-cart-product", authToken, deleteAddToCartProduct);

// Order
router.post("/create-order", authToken, createOrder);
router.get("/order-list", authToken, orderController);
router.post("/webhook", webhooks);
router.get("/all-order", authToken, allOrderController);
router.post("/update-order/:orderId", authToken, updateOrderStatus);

// Rating
router.post("/rating/:productId", authToken, addRating);
router.get("/ratings/:productId", getRatingsByProduct);

// Chat
router.get("/chat/:productId", getMessages);
router.post("/chat/:productId", authToken, sendMessage);
router.get("/chats", authToken, getAllChatController);
router.delete("/delete/:id", deleteChatController);

// Notifications
router.get("/notifications/replies", authToken, notificationsReplies);
router.patch("/notifications/replies/read", authToken, markAllRepliesRead);

// Forgot password
router.post("/forgot-password", forgotPasswordController);
router.post("/verify-forgot-password-otp", verifyForgotPasswordOtp);
router.post("/reset-password", resetPassword);

// OTP
router.post(
  "/auth/send-otp-all",
  authToken,
  requireVerification,
  sendOtpToAllUsers
);
router.post("/auth/send-otp", authToken, requireVerification, sendOtpToOneUser);

// ========== Chatbot AI ==========
router.post("/chatbot", getBotResponse);

module.exports = router;
