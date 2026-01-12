import dotenv from "dotenv";
import ConnectDb from "./db/db.js";
import { app } from "./app.js";
import http from "http";
import { Server } from "socket.io";
dotenv.config({
  path: "./.env",
});
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    methods: ["GET", "POST"],
    credentials: true,
    origin: process.env.CLIENT_URL,
  },
  transports: ["websocket", "polling"],
});
export const activeTicketUsers = {};
// Handle socket connections
io.on("connection", (socket) => {
  socket.on("join-page-room", (room) => {
    socket.join(room);
  });

  socket.on("leave-page-room", (room) => {
    socket.leave(room);
  });
  // Example: join a room for ticket
  socket.on("joinRoom", ({ ticketId, userId }) => {
    socket.join(ticketId);

    if (!activeTicketUsers[ticketId]) activeTicketUsers[ticketId] = new Set();
    activeTicketUsers[ticketId].add(userId);
  });

  socket.on("leaveRoom", ({ ticketId, userId }) => {
    socket.leave(ticketId);
    activeTicketUsers[ticketId]?.delete(userId);
  });
  socket.on("joinUserRoom", ({ userId }) => {
    socket.join(`user_${userId}`);
    logUserRooms();
  });
  socket.on("leaveUserRoom", ({ userId }) => {
    socket.leave(`user_${userId}`);
    logUserRooms();
  });

  socket.on("disconnect", () => {
    Object.keys(activeTicketUsers).forEach((ticketId) => {
      activeTicketUsers[ticketId]?.delete(socket.id); // if you map socketId to userId
    });
  });
});
function logUserRooms() {
  const rooms = io.sockets.adapter.rooms;
  const sids = io.sockets.adapter.sids;

  const userRooms = [];

  for (const [roomId, socketsSet] of rooms) {
    // ❌ skip auto-created socket rooms
    if (!sids.has(roomId) && roomId.startsWith("user_")) {
      userRooms.push({
        roomId,
        connectedSockets: [...socketsSet],
        totalUsers: socketsSet.size,
      });
    }
  }

  console.log("🔌 Active User Rooms:", userRooms);
}
ConnectDb()
  .then(() => {
    server.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
