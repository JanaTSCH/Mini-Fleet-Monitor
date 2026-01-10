const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const { initDB } = require("./config/db");
const authRoutes = require("./routes/auth");
const robotsRoutes = require("./routes/robots");
const { startSimulation, toggleSimulation } = require("./simulation");

const app = express();
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
);

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/robots", robotsRoutes);

// POST /simulation/toggle
app.post("/simulation/toggle", (req, res) => {
  const isRunning = toggleSimulation();
  res.json({ running: isRunning });
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3002;

const startServer = async () => {
  await initDB();

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    startSimulation(io);
  });
};

startServer();
