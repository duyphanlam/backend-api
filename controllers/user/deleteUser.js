// const userModel = require("../../models/userModel");

// async function deleteUser(req, res) {
//     try {
//         const { id } = req.params;

//         console.log("Deleting user with ID:", id);

//         // Kiểm tra user có tồn tại
//         const user = await userModel.findById(id);
//         if (!user) {
//             return res.status(404).json({
//                 message: "Không tìm thấy người dùng",
//                 error: true,
//                 success: false
//             });
//         }

//         // Xóa user
//         await userModel.findByIdAndDelete(id);

//         console.log("User deleted successfully");

//         res.json({
//             message: "Xóa người dùng thành công",
//             error: false,
//             success: true
//         });

//     } catch (err) {
//         console.error("Error in deleteUser:", err);
//         res.status(500).json({
//             message: err.message || "Lỗi server",
//             error: true,
//             success: false
//         });
//     }
// }

// module.exports = deleteUser;

const User = require("../../models/userModel");

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Kiểm tra userId có tồn tại
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Tìm user cần xóa
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại",
      });
    }

    // Xóa user
    await User.findByIdAndDelete(userId);

    // Trả về response JSON
    return res.status(200).json({
      success: true,
      message: "Xóa người dùng thành công",
      data: {
        deletedUserId: userId,
        deletedUserName: user.name,
      },
    });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa người dùng",
      error: error.message,
    });
  }
};

module.exports = deleteUser;
