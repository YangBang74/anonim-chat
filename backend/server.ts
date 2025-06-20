import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
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

type RoomMap = Map<string, string>;
const userRooms: RoomMap = new Map();

io.on("connection", (socket: Socket) => {
  console.log(`🟢 User connected: ${socket.id}`);

  socket.on("join-room", (roomId: string) => {
    socket.join(roomId);
    userRooms.set(socket.id, roomId);

    console.log(`➡️ ${socket.id} joined room ${roomId}`);

    socket.to(roomId).emit("system-message", {
      text: "Пользователь подключился",
      timestamp: Date.now(),
    });
  });

  socket.on(
    "send-message",
    ({ roomId, message }: { roomId: string; message: string }) => {
      io.to(roomId).emit("receive-message", {
        id: socket.id,
        text: message,
        timestamp: Date.now(),
      });
    }
  );

  socket.on("typing", (roomId: string) => {
    socket.to(roomId).emit("user-typing", { id: socket.id });
  });

  socket.on("disconnect", () => {
    const roomId = userRooms.get(socket.id);
    if (roomId) {
      socket.to(roomId).emit("system-message", {
        text: "Пользователь отключился",
        timestamp: Date.now(),
      });
      console.log(`🔴 ${socket.id} disconnected from ${roomId}`);
      userRooms.delete(socket.id);
    } else {
      console.log(`🔴 ${socket.id} disconnected (no room)`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
