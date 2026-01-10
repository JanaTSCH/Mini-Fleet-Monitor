const express = require("express");
const { pool } = require("../config/db");
const { authenticateToken } = require("../middleware/auth");
const redis = require("redis");

const router = express.Router();

// Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

redisClient.connect().catch(console.error);

// GET /robots (Redis  TTL 10s)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const cached = await redisClient.get("robots_list");

    if (cached) {
      console.log("✅ Robots from cache");
      return res.json(JSON.parse(cached));
    }
    const result = await pool.query("SELECT * FROM robots ORDER BY id");
    const robots = result.rows;

    await redisClient.setEx("robots_list", 10, JSON.stringify(robots));

    console.log("✅ Robots from DB (cached for 10s)");
    res.json(robots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /robots - add new robot
router.post("/", authenticateToken, async (req, res) => {
  const { name, lat, lon } = req.body;

  if (!name || !lat || !lon) {
    return res
      .status(400)
      .json({ error: "Missing required fields: name, lat, lon" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO robots (name, status, lat, lon, battery) VALUES ($1, 'idle', $2, $3, 85) RETURNING *",
      [name, lat, lon]
    );

    // clean cache
    await redisClient.del("robots_list");

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /robots/:id/move
router.post("/:id/move", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // generate random move
    const result = await pool.query("SELECT * FROM robots WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Robot not found" });
    }

    const robot = result.rows[0];
    const newLat = parseFloat(robot.lat) + (Math.random() - 0.5) * 0.001;
    const newLon = parseFloat(robot.lon) + (Math.random() - 0.5) * 0.001;
    const newStatus = "moving";

    await pool.query(
      "UPDATE robots SET lat = $1, lon = $2, status = $3, updated_at = NOW() WHERE id = $4",
      [newLat, newLon, newStatus, id]
    );

    // clean cache
    await redisClient.del("robots_list");

    res.json({
      id: parseInt(id),
      lat: newLat,
      lon: newLon,
      status: newStatus,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /robots/:id/history
router.get("/:id/history", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT lat, lon, recorded_at FROM robot_positions WHERE robot_id = $1 ORDER BY recorded_at DESC LIMIT 20",
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
