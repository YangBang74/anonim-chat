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

io.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId;
  console.log(`🟢 User connected: ${userId}`);

  onlineUsers.add(userId);

  socket.on("request-status", () => {
    const chattingUsers = new Set();
    for (const { userId: uid } of userRooms.values()) {
      chattingUsers.add(uid);
    }
    const searchingUsers = waitingUsers.map((u) => u.userId);

    socket.emit("status-info", {
      onlineUsers: Array.from(onlineUsers),
      chattingUsers: Array.from(chattingUsers),
      searchingUsers,
    });
  });

  socket.on("find-room", () => {
    if (waitingUsers.length > 0) {
      const { socket: peerSocket, userId: peerId } = waitingUsers.shift();
      const roomId = uuidv4();

      socket.join(roomId);
      peerSocket.join(roomId);

      userRooms.set(socket.id, { roomId, userId });
      userRooms.set(peerSocket.id, { roomId, userId: peerId });

      socket.emit("room-found", { roomId, peerId });
      peerSocket.emit("room-found", { roomId, peerId: userId });

      console.log(`✅ Match: ${userId}↔${peerId} → ${roomId}`);
    } else {
      waitingUsers.push({ socket, userId });
      socket.emit("waiting");
      console.log(`⌛ ${userId} waiting`);
    }
  });

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    userRooms.set(socket.id, { roomId, userId });
    const socketsInRoom = io.sockets.adapter.rooms.get(roomId) || new Set();
    const usersInRoom = [];
    for (const sockId of socketsInRoom) {
      if (sockId !== socket.id) {
        const info = userRooms.get(sockId);
        if (info) usersInRoom.push(info.userId);
      }
    }

    socket.emit("online-users-in-room", usersInRoom);
    socket.to(roomId).emit("user-online", { userId });
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
      const { roomId } = info;
      socket.to(roomId).emit("user-offline", { userId });
      userRooms.delete(socket.id);
      console.log(`🔴 ${userId} left ${roomId}`);
    }
    const idx = waitingUsers.findIndex((u) => u.userId === userId);
    if (idx !== -1) waitingUsers.splice(idx, 1);
  });
});

server.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));
