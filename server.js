const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
const PORT = 3000;

// Connect to SQLite database
const db = new Database("students.db");

// Create table
db.prepare(`
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roll_no TEXT NOT NULL,
        name TEXT NOT NULL,
        course TEXT NOT NULL
    )
`).run();

app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname)));

// Get all students
app.get("/api/students", (req, res) => {

    const students = db.prepare(`
        SELECT * FROM students
        ORDER BY id DESC
    `).all();

    res.json(students);
});

// Add student
app.post("/api/students", (req, res) => {

    const { rollNo, name, course } = req.body;

    if (!rollNo || !name || !course) {
        return res.status(400).json({
            error: "All fields are required"
        });
    }

    const result = db.prepare(`
        INSERT INTO students (roll_no, name, course)
        VALUES (?, ?, ?)
    `).run(rollNo, name, course);

    const student = db.prepare(`
        SELECT * FROM students
        WHERE id = ?
    `).get(result.lastInsertRowid);

    res.json(student);
});

// Delete student
app.delete("/api/students/:id", (req, res) => {

    const id = req.params.id;

    db.prepare(`
        DELETE FROM students
        WHERE id = ?
    `).run(id);

    res.json({
        message: "Student deleted successfully"
    });
});

// Test
app.get("/api/test", (req, res) => {

    res.json({
        message: "Backend and database are working!"
    });
});

// Start server
app.listen(PORT, () => {

    console.log(`Server running at http://localhost:${PORT}`);

});