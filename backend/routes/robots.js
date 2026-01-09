const express = require("express");
const { pool } = require("../config/db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// GET robots
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM robots ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST robots move simulation
router.post("/:id/move", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    // get current position
    const result = await pool.query("SELECT * FROM robots WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Robot is not found" });
    }

    const robot = result.rows[0];

    // random move - new position
    const newLat = parseFloat(robot.lat) + (Math.random() - 0.5) * 0.01;
    const newLon = parseFloat(robot.lon) + (Math.random() - 0.5) * 0.01;

    // update position
    await pool.query(
      "UPDATE robots SET lat = $1, lon = $2, status = $3, updated_at = NOW() WHERE id = $4",
      [newLat, newLon, "moving", id]
    );

    res.json({ id, lat: newLat, lon: newLon, status: "moving" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
