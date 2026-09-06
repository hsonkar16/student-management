require("dotenv").config();

const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Create students table
async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      roll_no TEXT NOT NULL,
      name TEXT NOT NULL,
      course TEXT NOT NULL
    )
  `);

  console.log("PostgreSQL database connected.");
  console.log("Students table is ready.");
}

// Test API
app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working with PostgreSQL"
  });
});

// Get all students
app.get("/api/students", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, roll_no, name, course
      FROM students
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({
      error: "Failed to fetch students"
    });
  }
});

// Add student
app.post("/api/students", async (req, res) => {
  try {
    const { roll_no, name, course } = req.body;

    if (!roll_no || !name || !course) {
      return res.status(400).json({
        error: "Roll No, Name and Course are required"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO students (roll_no, name, course)
      VALUES ($1, $2, $3)
      RETURNING id, roll_no, name, course
      `,
      [roll_no, name, course]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding student:", error);
    res.status(500).json({
      error: "Failed to add student"
    });
  }
});

// Delete student
app.delete("/api/students/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM students WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Student not found"
      });
    }

    res.json({
      message: "Student deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({
      error: "Failed to delete student"
    });
  }
});

// Start server only after database is ready
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:");
    console.error(error);
    process.exit(1);
  });