import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

import { initDB } from "./config/db.js";
import { startSimulation } from "./routes/simulation.js";
import authRoutes from "./routes/auth.js";
import robotRoutes from "./routes/robots.js";
import simulationRoutes from "./routes/simulation.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/robots", robotRoutes);
app.use("/simulation", simulationRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

await initDB();
startSimulation(io);

const PORT = process.env.PORT || 3002;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
