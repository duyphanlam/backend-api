const jwt = require("jsonwebtoken");
const User = require("../../models/userModel");

const userGoogleLogin = async (req, res) => {
  try {
    const { id, displayName, emails, photos } = req.user;

    let user = await User.findOne({ email: emails[0].value });
    if (!user) {
      user = new User({
        name: displayName,
        email: emails[0].value,
        avatar: photos[0].value,
        googleId: id,
        password: null,
      });
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: "7d" }
    );

    const tokenOption = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true trên HTTPS
      sameSite: process.env.NODE_ENV === "production" ? "None" : "lax", // None với HTTPS
      // Không set domain, để mặc định
    };

    res.cookie("token", token, tokenOption);
    res.redirect(`${process.env.FRONTEND_URL}/login/success?token=${token}`); // Thêm token vào query
  } catch (err) {
    console.error("Google Login Error:", err);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(err.message)}`);
  }
};

module.exports = userGoogleLogin;