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
  transports: ["websocket"],
});
export const activeTicketUsers = {};
// Handle socket connections
io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  // Example: join a room for ticket
  socket.on("joinRoom", ({ ticketId, userId }) => {
    socket.join(ticketId);
    console.log("user joined ticket room", ticketId);

    if (!activeTicketUsers[ticketId]) activeTicketUsers[ticketId] = new Set();
    activeTicketUsers[ticketId].add(userId);
  });

  socket.on("leaveRoom", ({ ticketId, userId }) => {
    socket.leave(ticketId);
    activeTicketUsers[ticketId]?.delete(userId);
  });
  socket.on("joinUserRoom", ({ userId }) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined notification room`);
  });
  socket.on("leaveUserRoom", ({ userId }) => {
    socket.leave(`user_${userId}`);
    console.log(`User ${userId} left notification room`);
  });

  socket.on("disconnect", () => {
    Object.keys(activeTicketUsers).forEach((ticketId) => {
      activeTicketUsers[ticketId]?.delete(socket.id); // if you map socketId to userId
    });
  });
});
ConnectDb()
  .then(() => {
    server.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
