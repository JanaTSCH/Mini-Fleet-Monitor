const { pool } = require("./config/db");

let simulationInterval = null;

const startSimulation = (io) => {
  console.log("Robot simulation started");
  simulationInterval = setInterval(async () => {
    try {
      // get al robots
      const result = await pool.query("SELECT * FROM robots");
      const robots = result.rows;

      // new position for each robot
      for (const robot of robots) {
        const newLat = parseFloat(robot.lat) + (Math.random() - 0.5) * 0.002;
        const newLon = parseFloat(robot.lon) + (Math.random() - 0.5) * 0.002;
        const newStatus = Math.random() > 0.7 ? "idle" : "moving";

        // update in db
        await pool.query(
          "UPDATE robots SET lat = $1, lon = $2, status = $3, updated_at = NOW() WHERE id = $4",
          [newLat, newLon, newStatus, robot.id]
        );

        // sent to clients with websocket
        io.emit("robotUpdate", {
          id: robot.id,
          name: robot.name,
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

const stopSimulation = () => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    console.log("Simulation stopped");
  }
};

module.exports = { startSimulation, stopSimulation };
