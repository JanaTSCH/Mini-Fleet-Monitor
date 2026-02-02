import express from "express";
import redis from "redis";

import { pool } from "../config/db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.connect().catch(console.error);

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

    await redisClient.del("robots_list");
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

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

export default router;
