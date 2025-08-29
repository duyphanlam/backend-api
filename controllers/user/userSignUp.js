const userModel = require("../../models/userModel");
const bcrypt = require("bcryptjs");
const sendEmail = require("../../config/sendEmail");

async function userSignUpController(req, res) {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập email", success: false });
    }
    if (!password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập mật khẩu", success: false });
    }
    if (!name) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập họ tên", success: false });
    }

    // Check email đã tồn tại chưa
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email đã được sử dụng", success: false });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Sinh OTP 6 số và hạn dùng 5 phút
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    // Payload tạo user
    const newUser = new userModel({
      name,
      email,
      password: hashPassword,
      role: "GENERAL",
      isVerified: false,
      signup_otp: otp,
      signup_otp_expiry: otpExpires,
    });

    const savedUser = await newUser.save();

    // Gửi OTP qua email
    await sendEmail({
      sendTo: email,
      subject: "Xác thực tài khoản",
      html: `
        <h3>Xin chào ${name},</h3>
        <p>Mã OTP để xác thực tài khoản của bạn là:</p>
        <h1 style="color:blue">${otp}</h1>
        <p>OTP sẽ hết hạn trong 5 phút.</p>
      `,
    });

    // Xóa password trước khi trả về client
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    delete userResponse.signup_otp;
    delete userResponse.signup_otp_expiry;

    res.status(201).json({
      data: userResponse,
      success: true,
      message: "Đăng ký thành công. Vui lòng kiểm tra email để nhập OTP.",
    });
  } catch (err) {
    console.error("SignUp Error:", err);
    res.status(500).json({
      message: err.message || "Đã xảy ra lỗi",
      success: false,
    });
  }
}

module.exports = userSignUpController;
