const { pool } = require("./config/db");
const redis = require("redis");

let redisClient;
let simulationInterval;
let isRunning = false;

const startSimulation = async (io) => {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL,
  });

  await redisClient.connect().catch(console.error);

  simulationInterval = setInterval(async () => {
    if (!isRunning) return;

    try {
      const result = await pool.query("SELECT * FROM robots");
      const robots = result.rows;

      for (const robot of robots) {
        const newLat = parseFloat(robot.lat) + (Math.random() - 0.5) * 0.001;
        const newLon = parseFloat(robot.lon) + (Math.random() - 0.5) * 0.001;
        const newStatus = Math.random() > 0.5 ? "moving" : "idle";

        await pool.query(
          "UPDATE robots SET lat = $1, lon = $2, status = $3, updated_at = NOW() WHERE id = $4",
          [newLat, newLon, newStatus, robot.id]
        );

        // save robot position
        await pool.query(
          "INSERT INTO robot_positions (robot_id, lat, lon) VALUES ($1, $2, $3)",
          [robot.id, newLat, newLon]
        );

        io.emit("robotUpdate", {
          id: robot.id,
          lat: newLat,
          lon: newLon,
          status: newStatus,
        });
      }

      await redisClient.del("robots_list");
    } catch (error) {
      console.error("Simulation error:", error);
    }
  }, 2000);

  // Автостарт
  isRunning = true;
  console.log("Simulation started");
};

const toggleSimulation = () => {
  isRunning = !isRunning;
  console.log(isRunning ? "▶Simulation resumed" : "Simulation paused");
  return isRunning;
};

module.exports = { startSimulation, toggleSimulation };
