const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const { initDB } = require("./config/db");
const authRoutes = require("./routes/auth");
const robotsRoutes = require("./routes/robots");
const { startSimulation } = require("./simulation");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3001", // Frontend URL
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/robots", robotsRoutes);

// WebSocket
io.on("connection", (socket) => {
  console.log("Client connected", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await initDB();

  server.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
    startSimulation(io);
  });
};

startServer();
