async function userLogout(req, res) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(200).json({
      message: "Đăng xuất thành công!",
      error: false,
      success: true,
    });
  } catch (err) {
    console.error("Logout Error:", err);
    res.status(500).json({
      message: err.message || "Có lỗi xảy ra khi đăng xuất",
      error: true,
      success: false,
    });
  }
}

module.exports = userLogout;
