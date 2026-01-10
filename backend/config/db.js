const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initDB = async () => {
  try {
    // users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // robots table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS robots (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'idle',
        lat DECIMAL(10, 7) NOT NULL,
        lon DECIMAL(10, 7) NOT NULL,
        battery INT,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // test user
    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash("test123", 10);

    await pool.query(
      `
      INSERT INTO users (email, password, role)
      VALUES ('admin@test.com', $1, 'admin')
      ON CONFLICT (email) DO NOTHING
    `,
      [hashedPassword]
    );

    // 3 test robots (Erfurt coordinates)
    await pool.query(`
      INSERT INTO robots (name, status, lat, lon, battery)
      VALUES 
        ('Robot-A', 'idle', 50.9787, 11.0328, 85),
        ('Robot-B', 'moving', 50.9800, 11.0340, 72),
        ('Robot-C', 'idle', 50.9750, 11.0300, 91)
      ON CONFLICT DO NOTHING
    `);

    console.log("DB initialized");
  } catch (error) {
    console.error("DB initialization error:", error);
  }
};

module.exports = { pool, initDB };
