const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
require("dotenv").config();
const connectDB = require("./config/db");
const router = require("./routes");
const http = require("http");
const { Server } = require("socket.io");
const passport = require("./config/passport");

const app = express();

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "https://linklap.com.vn"],
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.TOKEN_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const { token } = req.user;
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.redirect(process.env.FRONTEND_URL);
  }
);
app.get("/auth/login/success", (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      user: req.user.user,
      token: req.user.token,
    });
  } else {
    res.json({ success: false });
  }
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL, "https://linklap.com.vn"],
    credentials: true,
    methods: ["GET", "POST"],
  },
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api", router);

// Socket.io logic giữ nguyên
const onlineStaff = new Map();
const waitingUsers = new Map();

const broadcastWaitingList = () => {
  const staffSockets = Array.from(onlineStaff.values()).map((s) => s.socketId);
  if (staffSockets.length > 0) {
    io.to(staffSockets).emit("update_waiting_list", Array.from(waitingUsers.values()));
  }
};

io.on("connection", (socket) => {
  console.log("🔌 Một người dùng vừa kết nối:", socket.id);

  socket.on("staff_join", (staffInfo) => {
    console.log(`Nhân viên ${staffInfo.name} (ID: ${socket.id}) vừa online.`);
    onlineStaff.set(socket.id, { ...staffInfo, status: "available", socketId: socket.id });
    socket.emit("update_waiting_list", Array.from(waitingUsers.values()));
  });

  socket.on("user_request_support", (userInfo) => {
    console.log(`User ${userInfo.name} (ID: ${socket.id}) cần hỗ trợ.`);
    waitingUsers.set(socket.id, { ...userInfo, socketId: socket.id });
    broadcastWaitingList();
  });

  socket.on("staff_accept_chat", ({ room, customerId }) => {
    console.log(`Nhân viên ${socket.id} đã chấp nhận chat với khách ${customerId}`);
    socket.join(room);
    waitingUsers.delete(customerId);
    broadcastWaitingList();

    const staffData = onlineStaff.get(socket.id);
    if (staffData) {
      staffData.status = "busy";
      io.to(room).emit("chat_started", {
        message: "Nhân viên đã tham gia cuộc trò chuyện. Bạn cần hỗ trợ gì?",
        staff: { name: staffData.name, profilePic: staffData.profilePic },
      });
    }
  });

  socket.on("chat_message", ({ room, sender, message }) => {
    const customerId = room.replace("support_room_", "");
    io.to(room).emit("new_message", { sender, message, customerId });
  });

  socket.on("disconnect", () => {
    console.log("🔥 Người dùng ngắt kết nối:", socket.id);
    if (onlineStaff.has(socket.id)) onlineStaff.delete(socket.id);
    if (waitingUsers.has(socket.id)) {
      waitingUsers.delete(socket.id);
      broadcastWaitingList();
    }
  });
});

// Sửa phần listen server
const PORT = process.env.PORT || 8080;
connectDB()
  .then(() => {
    server.listen(PORT, '0.0.0.0', () => {  // Bind tất cả interface
      console.log("Kết nối MongoDB thành công");
      console.log(`Server đang chạy tại port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Lỗi kết nối MongoDB:", error.message);  // Log lỗi DB
    process.exit(1);  // Thoát nếu DB fail, tránh server crash ngầm
  });