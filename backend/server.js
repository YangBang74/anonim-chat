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
    origin: "https://anonim-chat-kohl.vercel.app",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;

const userSockets = new Map();
const onlineUsers = new Set();
const userRooms = new Map();
const waitingUsers = [];
const inviteLinks = new Map();

function ageMatches(age, ranges) {
  if (!Array.isArray(ranges) || ranges.length === 0 || ranges.includes(null)) {
    return true; // "не важно"
  }

  const numericAge = parseInt(age);
  return ranges.some((range) => {
    if (!range) return true;

    if (range.includes("+")) {
      const minAge = parseInt(range, 10);
      return numericAge >= minAge;
    }
    if (range.includes("-")) {
      const [min, max] = range.split("-").map(Number);
      return numericAge >= min && numericAge <= max;
    }
    const singleAge = parseInt(range, 10);
    return numericAge <= singleAge;
  });
}

function broadcastStatusUpdate() {
  const chattingUsers = new Set();
  for (const roomInfo of userRooms.values()) {
    chattingUsers.add(roomInfo.userId);
  }
  const searchingUsers = waitingUsers.map((u) => u.userId);
  io.emit("status-update", {
    onlineUsers: Array.from(onlineUsers),
    chattingUsers: Array.from(chattingUsers),
    searchingUsers,
  });
}

io.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId;
  socket.userId = userId;

  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
    onlineUsers.add(userId);
  }
  userSockets.get(userId).add(socket.id);

  broadcastStatusUpdate();

  socket.on("find-room", ({ criteria, myData }) => {
    if (waitingUsers.some((u) => u.userId === userId)) {
      socket.emit("error", "Вы уже находитесь в поиске.");
      return;
    }

    const peerIndex = waitingUsers.findIndex((peer) => {
      const peerMatches =
        ageMatches(peer.myData.age, criteria.age) &&
        (criteria.gender === "any" || peer.myData.gender === criteria.gender);

      const userMatches =
        ageMatches(myData.age, peer.criteria.age) &&
        (peer.criteria.gender === "any" ||
          myData.gender === peer.criteria.gender);

      return peerMatches && userMatches && peer.socket.connected;
    });

    if (peerIndex !== -1) {
      const [peer] = waitingUsers.splice(peerIndex, 1);
      const roomId = uuidv4().slice(0, 8);
      socket.join(roomId);
      peer.socket.join(roomId);
      userRooms.set(socket.id, { roomId, userId });
      userRooms.set(peer.socket.id, { roomId, userId: peer.userId });
      socket.emit("room-found", { roomId, peerId: peer.userId });
      peer.socket.emit("room-found", { roomId, peerId: userId });
    } else {
      waitingUsers.push({ socket, userId, criteria, myData });
      socket.emit("waiting");
    }

    broadcastStatusUpdate();
  });

  socket.on("cancel-search", ({ userId }) => {
    const index = waitingUsers.findIndex((u) => u.userId === userId);
    if (index !== -1) {
      waitingUsers.splice(index, 1);
      broadcastStatusUpdate();
    }
  });

  socket.on("disconnect", () => {
    const sockets = userSockets.get(socket.userId);
    if (sockets) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        userSockets.delete(socket.userId);
        onlineUsers.delete(socket.userId);
      }
    }
    userRooms.delete(socket.id);

    const idx = waitingUsers.findIndex((u) => u.socket.id === socket.id);
    if (idx !== -1) {
      waitingUsers.splice(idx, 1);
    }

    broadcastStatusUpdate();
  });

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    userRooms.set(socket.id, { roomId, userId });

    const socketsInRoom = io.sockets.adapter.rooms.get(roomId) || new Set();
    const usersInRoom = [];
    for (const sockId of socketsInRoom) {
      const info = userRooms.get(sockId);
      if (info) {
        usersInRoom.push(info.userId);
      }
    }

    socket.emit("online-users-in-room", usersInRoom);
    socket.to(roomId).emit("user-online", { userId });
  });

  socket.on("leave-room", (roomId) => {
    socket.leave(roomId);
    socket.to(roomId).emit("user-offline", { userId });
    userRooms.delete(socket.id);
    broadcastStatusUpdate();
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
    const room = io.sockets.adapter.rooms.get(roomId);
    if (room) {
      room.forEach((socketId) => {
        const clientSocket = io.sockets.sockets.get(socketId);
        if (clientSocket) {
          userRooms.delete(clientSocket.id);
          clientSocket.leave(roomId);
        }
      });
    }
    broadcastStatusUpdate();
  });

  socket.on("create-invite", () => {
    const inviteCode = uuidv4().slice(0, 8);
    const roomId = uuidv4().slice(0, 8);
    const expiresAt = Date.now() + 60 * 60 * 1000;
    inviteLinks.set(inviteCode, { roomId, expiresAt });
    socket.emit("invite-created", inviteCode);
  });

  socket.on("join-invite", (code) => {
    const invite = inviteLinks.get(code);
    if (!invite) {
      return socket.emit("invite-error", "Приглашение не найдено.");
    }
    const now = Date.now();
    if (invite.expiresAt < now) {
      inviteLinks.delete(code);
      return socket.emit("invite-error", "Срок действия ссылки истёк.");
    }
    const { roomId } = invite;
    socket.join(roomId);
    userRooms.set(socket.id, { roomId, userId });
    socket.emit("room-found", { roomId });
    socket.to(roomId).emit("user-online", { userId });
  });

  socket.on("remove-invite", (code) => {
    if (inviteLinks.has(code)) {
      inviteLinks.delete(code);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
