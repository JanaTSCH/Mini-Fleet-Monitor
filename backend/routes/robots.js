import express from "express";
import redis from "redis";
import { pool } from "../config/db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

let redisReady = false;

redisClient.on("connect", () => {
  console.log("🔴 Redis: Connecting...");
});

redisClient.on("ready", () => {
  console.log("🔴 Redis: Connected and ready!");
  redisReady = true;
});

redisClient.on("error", (err) => {
  console.error("🔴 Redis error:", err.message);
  redisReady = false;
});

redisClient.connect().catch((err) => {
  console.error("🔴 Failed to connect to Redis:", err.message);
});

// GET /robots - without caching, with Socket.io
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM robots ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /robots
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
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /robots/:id/history
router.get("/:id/history", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const cacheKey = `robot_history_${id}`;

  try {
    console.log(`🔍 [Robot ${id}] Redis ready:`, redisReady);

    if (!redisReady) {
      console.log(`⚠️ [Robot ${id}] Redis not ready, using DB only`);
      const result = await pool.query(
        `SELECT lat, lon, recorded_at 
         FROM robot_positions 
         WHERE robot_id = $1 
         ORDER BY recorded_at DESC 
         LIMIT 20`,
        [id]
      );
      res.set("X-Cache-Status", "MISS");
      res.set("X-Cache-TTL", "0");
      console.log(`📊 History from DB for robot ${id} (Redis unavailable)`);
      return res.json(result.rows);
    }

    // chache checking
    console.log(`🔍 [Robot ${id}] Checking cache key:`, cacheKey);
    const cached = await redisClient.get(cacheKey);
    console.log(`🔍 [Robot ${id}] Cache result:`, cached ? "HIT" : "MISS");

    if (cached) {
      // ✅ CACHE HIT
      const ttl = await redisClient.ttl(cacheKey);
      console.log(`🔍 [Robot ${id}] TTL:`, ttl);

      res.set("X-Cache-Status", "HIT");
      res.set("X-Cache-TTL", ttl.toString());

      console.log(`✅ History from cache for robot ${id} (TTL: ${ttl}s)`);
      return res.json(JSON.parse(cached));
    }

    // ❌ CACHE MISS
    console.log(`🔍 [Robot ${id}] Fetching from DB...`);
    const result = await pool.query(
      `SELECT lat, lon, recorded_at 
       FROM robot_positions 
       WHERE robot_id = $1 
       ORDER BY recorded_at DESC 
       LIMIT 20`,
      [id]
    );

    console.log(`🔍 [Robot ${id}] DB returned ${result.rows.length} rows`);

    // save cache for 30 sec
    const ttl = 30;
    const dataToCache = JSON.stringify(result.rows);
    console.log(`🔍 [Robot ${id}] Saving to cache (TTL: ${ttl}s)...`);

    const setResult = await redisClient.setEx(cacheKey, ttl, dataToCache);
    console.log(`🔍 [Robot ${id}] SetEx result:`, setResult);

    // checking saved data
    const verify = await redisClient.get(cacheKey);
    console.log(`🔍 [Robot ${id}] Verify saved:`, verify ? "YES ✅" : "NO ❌");

    res.set("X-Cache-Status", "MISS");
    res.set("X-Cache-TTL", ttl.toString());

    console.log(`📊 History from DB for robot ${id} (cached for ${ttl}s)`);
    res.json(result.rows);
  } catch (error) {
    console.error(`🔴 [Robot ${id}] Error:`, error.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
