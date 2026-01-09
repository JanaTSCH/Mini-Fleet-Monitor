const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const initDB = async () => {
  try {
    // users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // robots
    await pool.query(`
      CREATE TABLE IF NOT EXISTS robots (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'idle',
        lat DECIMAL(10, 7) NOT NULL,
        lon DECIMAL(10, 7) NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // add test-user
    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash("test123", 10);

    await pool.query(
      `
      INSERT INTO users (email, password_hash)
      VALUES ('admin@test.com', $1)
      ON CONFLICT (email) DO NOTHING
    `,
      [hashedPassword]
    );

    // add test-robots
    await pool.query(`
      INSERT INTO robots (name, status, lat, lon)
      VALUES 
        ('Robot-1', 'idle', 50.9787, 11.0328),
        ('Robot-2', 'moving', 50.9800, 11.0340),
        ('Robot-3', 'idle', 50.9750, 11.0300)
      ON CONFLICT DO NOTHING
    `);

    console.log("DB initialized");
  } catch (error) {
    console.error("Initializing DB failed", error);
  }
};

module.exports = { pool, initDB };
