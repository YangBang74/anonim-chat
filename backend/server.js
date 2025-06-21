import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

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
const waitingUsers = [];
let roomCount = 1;

io.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId;
  console.log(`🟢 User connected: ${userId}`);

  onlineUsers.add(userId);
  socket.broadcast.emit("user-online", { userId });

  socket.on("find-room", () => {
    if (waitingUsers.length > 0) {
      const { socket: peerSocket, userId: peerId } = waitingUsers.shift();

      const newRoomId = uuidv4();
      socket.join(newRoomId);
      peerSocket.join(newRoomId);

      userRooms.set(socket.id, { roomId: newRoomId, userId });
      userRooms.set(peerSocket.id, { roomId: newRoomId, userId: peerId });

      socket.emit("room-found", { roomId: newRoomId, peerId });
      peerSocket.emit("room-found", { roomId: newRoomId, peerId: userId });

      console.log(`✅ Match found: ${userId} & ${peerId} → ${newRoomId}`);
    } else {
      waitingUsers.push({ socket, userId });
      socket.emit("waiting");
      console.log(`⌛ ${userId} is waiting for chat...`);
    }
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

    const index = waitingUsers.findIndex((u) => u.userId === userId);
    if (index !== -1) waitingUsers.splice(index, 1);

    const info = userRooms.get(socket.id);
    if (info) {
      const { roomId } = info;
      socket.to(roomId).emit("user-offline", { userId });
      userRooms.delete(socket.id);
      console.log(`🔴 ${userId} disconnected from ${roomId}`);
    } else {
      console.log(`🔴 Unknown user (${userId}) disconnected`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
