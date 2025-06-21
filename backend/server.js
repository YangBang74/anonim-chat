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

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    userRooms.set(socket.id, { roomId, userId });

    const socketsInRoom = io.sockets.adapter.rooms.get(roomId) || new Set();
    const usersInRoom = [];
    for (const socketId of socketsInRoom) {
      if (socketId !== socket.id) {
        const info = userRooms.get(socketId);
        if (info) usersInRoom.push(info.userId);
      }
    }

    socket.emit("online-users", usersInRoom);
    socket.to(roomId).emit("user-online", { userId });
  });

  socket.on("request-status", () => {
    const chattingUsers = new Set();
    for (const { userId } of userRooms.values()) {
      chattingUsers.add(userId);
    }

    const searchingUsers = waitingUsers.map((u) => u.userId);

    socket.emit("status-info", {
      onlineUsers: Array.from(onlineUsers),
      chattingUsers: Array.from(chattingUsers),
      searchingUsers,
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
      const { roomId } = info;
      socket.to(roomId).emit("user-offline", { userId });
      userRooms.delete(socket.id);
      console.log(`🔴 ${userId} disconnected from ${roomId}`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
