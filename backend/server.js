
const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5
});

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: "error", database: "unavailable" });
  }
});

app.get("/api/tasks", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, title, completed FROM tasks ORDER BY id DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Could not fetch tasks" });
  }
});

app.post("/api/tasks", async (req, res) => {
  const title = req.body.title?.trim();

  if (!title) {
    return res.status(400).json({ error: "Task title is required" });
  }

  try {
    const [result] = await pool.execute(
      "INSERT INTO tasks (title) VALUES (?)",
      [title]
    );

    res.status(201).json({
      id: result.insertId,
      title,
      completed: 0
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Could not create task" });
  }
});

app.listen(3000, "127.0.0.1", () => {
  console.log("Backend listening on port 3000");
});
