import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;

const userRooms = new Map();
const onlineUsers = new Set();

io.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId;
  console.log(`🟢 User connected: ${userId}`);

  onlineUsers.add(userId);
  socket.broadcast.emit("user-online", { userId });

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    userRooms.set(socket.id, { roomId, userId });

    // Отправляем подключившемуся клиенту список всех онлайн пользователей
    socket.emit("online-users", Array.from(onlineUsers));

    socket.to(roomId).emit("system-message", {
      text: "Пользователь подключился",
      timestamp: Date.now(),
    });
  });

  socket.on("send-message", ({ roomId, message, messageId, senderId }) => {
    io.to(roomId).emit("receive-message", {
      id: senderId,
      text: message,
      timestamp: messageId,
      status: "sent",
    });
  });

  socket.on("read-message", ({ roomId, messageId }) => {
    socket.to(roomId).emit("message-read", { messageId });
  });

  socket.on("typing", (roomId) => {
    socket.to(roomId).emit("user-typing", { id: userId });
  });

  socket.on("end-chat", (roomId) => {
    io.to(roomId).emit("chat-ended");
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(userId);

    const info = userRooms.get(socket.id);
    if (info) {
      const { roomId, userId } = info;
      socket.to(roomId).emit("user-offline", { userId });
      userRooms.delete(socket.id);
      console.log(`🔴 ${userId} disconnected from ${roomId}`);
    } else {
      console.log("🔴 Unknown user disconnected");
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
