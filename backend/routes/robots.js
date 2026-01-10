const express = require("express");
const { pool } = require("../config/db");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// GET /robots
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM robots ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
