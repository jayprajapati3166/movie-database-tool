const express = require("express");
const cors = require("cors");
const pool = require("./db");

const moviesRoutes = require("./routes/movies");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is running" });
});

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM movies");
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "DB test failed" });
  }
});

app.use("/api/movies", moviesRoutes);

module.exports = app;
