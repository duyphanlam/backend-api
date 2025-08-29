const jwt = require("jsonwebtoken");
const User = require("../../models/userModel"); // ✅ đúng đường dẫn

const userGoogleLogin = async (req, res) => {
  try {
    const { id, displayName, emails, photos } = req.user;

    // kiểm tra user tồn tại chưa
    let user = await User.findOne({ email: emails[0].value });

    if (!user) {
      user = new User({
        name: displayName,
        email: emails[0].value,
        avatar: photos[0].value, // avatar từ Google
        googleId: id, // lưu Google ID
        password: null, // Google login không cần password
      });
      await user.save();
    }

    // tạo JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: "7d" }
    );

    // set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // để true khi deploy HTTPS
      sameSite: "lax",
    });

    // redirect về frontend
    res.redirect(process.env.FRONTEND_URL);
  } catch (err) {
    console.error("Google Login Error:", err);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=google_login_failed`);
  }
};

module.exports = userGoogleLogin;
