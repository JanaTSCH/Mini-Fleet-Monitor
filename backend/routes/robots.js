import express from "express";
import { pool } from "../config/db.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

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

// GET /robots/:id/history
router.get("/:id/history", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM robot_positions WHERE robot_id = $1 ORDER BY recorded_at DESC LIMIT 50",
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch history:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

export default router;
