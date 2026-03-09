import express from "express";
import { createClient } from "redis";
import { pool } from "../config/db.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// REDIS SETUP

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

let redisReady = false;

redisClient.on("connect", () => {
  console.log("🔵 Redis: Connecting...");
});

redisClient.on("ready", () => {
  console.log("✅ Redis: Connected and ready!");
  redisReady = true;
});

redisClient.on("error", (err) => {
  console.error("❌ Redis error:", err.message);
  redisReady = false;
});

redisClient.connect().catch((err) => {
  console.error("❌ Failed to connect to Redis:", err.message);
});

// ROUTES

// GET /robots
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM robots ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch robots:", error);
    res.status(500).json({ error: "Failed to fetch robots" });
  }
});

// POST /robots - add by (admin, technician)
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin", "technician"),
  async (req, res) => {
    try {
      const { name, lat, lon } = req.body;
      const result = await pool.query(
        "INSERT INTO robots (name, lat, lon, battery, status) VALUES ($1, $2, $3, 100, 'idle') RETURNING *",
        [name, lat, lon]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Failed to add robot:", error);
      res.status(500).json({ error: "Failed to add robot" });
    }
  }
);

// DELETE /robots/:id - delete by (admin)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      // check if robot exists
      const check = await pool.query("SELECT id FROM robots WHERE id = $1", [
        id,
      ]);
      if (check.rows.length === 0) {
        return res.status(404).json({ error: "Robot not found" });
      }

      // delete robot
      await pool.query("DELETE FROM robots WHERE id = $1", [id]);

      res.json({ message: "Robot deleted successfully", id: parseInt(id) });
    } catch (error) {
      console.error("Failed to delete robot:", error);
      res.status(500).json({ error: "Failed to delete robot" });
    }
  }
);

// GET /robots/:id/history - WITH REDIS CACHE

router.get("/:id/history", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const cacheKey = `robot:history:${id}`;

  try {
    console.log(`[Robot ${id}] Redis ready: ${redisReady}`);

    // FALLBACK: Redis not ready → use DB only

    if (!redisReady) {
      console.log(`[Robot ${id}] Redis not ready, using DB only`);
      const result = await pool.query(
        "SELECT lat, lon, recorded_at FROM robot_positions WHERE robot_id = $1 ORDER BY recorded_at DESC LIMIT 20",
        [id]
      );

      res.set("X-Cache-Status", "MISS");
      res.set("X-Cache-TTL", "0");
      console.log(
        `✅ [Robot ${id}] History from DB (Redis unavailable): ${result.rows.length} positions`
      );
      return res.json(result.rows);
    }

    // CHECK CACHE

    console.log(`[Robot ${id}] ... Checking cache: ${cacheKey}`);
    const cached = await redisClient.get(cacheKey);
    console.log(`[Robot ${id}] Cache result: ${cached ? "HIT" : "MISS"}`);

    if (cached) {
      // CACHE HIT

      const ttl = await redisClient.ttl(cacheKey);
      console.log(`[Robot ${id}] TTL: ${ttl}s remaining`);

      res.set("X-Cache-Status", "HIT");
      res.set("X-Cache-TTL", ttl.toString());

      console.log(
        `✅ [Robot ${id}] History from CACHE (TTL: ${ttl}s): ${
          JSON.parse(cached).length
        } positions`
      );
      return res.json(JSON.parse(cached));
    }

    // CACHE MISS → Fetch from DB

    console.log(`[Robot ${id}] Fetching from DB...`);
    const result = await pool.query(
      "SELECT lat, lon, recorded_at FROM robot_positions WHERE robot_id = $1 ORDER BY recorded_at DESC LIMIT 20",
      [id]
    );

    console.log(`[Robot ${id}] DB returned: ${result.rows.length} positions`);

    // SAVE TO CACHE (30 seconds)

    const ttl = 30;
    const dataToCache = JSON.stringify(result.rows);

    console.log(`[Robot ${id}] Saving to cache (TTL: ${ttl}s)...`);
    const setResult = await redisClient.setEx(cacheKey, ttl, dataToCache);
    console.log(`[Robot ${id}] SetEx result: ${setResult}`);

    // Verify saved
    const verify = await redisClient.get(cacheKey);
    console.log(`[Robot ${id}] Verify saved: ${verify ? "YES" : "NO"}`);

    res.set("X-Cache-Status", "MISS");
    res.set("X-Cache-TTL", ttl.toString());

    console.log(
      `✅ [Robot ${id}] History from DB, cached for ${ttl}s: ${result.rows.length} positions`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(`❌ [Robot ${id}] Error:`, error.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
