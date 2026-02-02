import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const initDB = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ DB connected");
  } catch (error) {
    console.error("❌ DB error:", error.message);
  }
};
