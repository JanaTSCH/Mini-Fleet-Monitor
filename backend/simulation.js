const { pool } = require("./config/db");

const startSimulation = (io) => {
  setInterval(async () => {
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
};

module.exports = { startSimulation };
