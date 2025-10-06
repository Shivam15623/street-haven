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
});
// Handle socket connections
io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  // Example: join a room for ticket
  socket.on("joinRoom", (ticketId) => {
    socket.join(ticketId);
    console.log(`Socket ${socket.id} joined room ${ticketId}`);
  });

  socket.on("leaveRoom", (ticketId) => {
    socket.leave(ticketId);
    console.log(`Socket ${socket.id} left room ${ticketId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
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
