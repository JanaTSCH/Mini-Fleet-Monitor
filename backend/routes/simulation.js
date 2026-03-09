import express from "express";
import { pool } from "../config/db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

let simulationInterval;
let isRunning = false;
let io;

export const startSimulation = async (socketIO) => {
  io = socketIO;

  simulationInterval = setInterval(async () => {
    if (!isRunning) return;

    try {
      const result = await pool.query("SELECT * FROM robots");
      const robots = result.rows;

      for (const robot of robots) {
        const newLat = parseFloat(robot.lat) + (Math.random() - 0.5) * 0.001;
        const newLon = parseFloat(robot.lon) + (Math.random() - 0.5) * 0.001;
        const newStatus = Math.random() > 0.5 ? "moving" : "idle";

        // update robot
        await pool.query(
          "UPDATE robots SET lat = $1, lon = $2, status = $3, updated_at = NOW() WHERE id = $4",
          [newLat, newLon, newStatus, robot.id]
        );

        // add to history
        await pool.query(
          "INSERT INTO robot_positions (robot_id, lat, lon) VALUES ($1, $2, $3)",
          [robot.id, newLat, newLon]
        );

        // Socket.io push (real-time coords)
        io.emit("robotUpdate", {
          id: robot.id,
          lat: newLat,
          lon: newLon,
          status: newStatus,
        });
      }
    } catch (error) {
      console.error("Simulation error:", error);
    }
  }, 2000);

  isRunning = true;
  console.log("^-^ Robot Simulation started");
};

export const toggleSimulation = () => {
  isRunning = !isRunning;
  console.log(isRunning ? "▶ Simulation resumed" : "|| Simulation paused");
  return isRunning;
};

router.post("/toggle", authenticateToken, (req, res) => {
  const status = toggleSimulation();
  res.json({
    running: status,
    message: status ? "Simulation started" : "Simulation paused",
  });
});

export default router;
