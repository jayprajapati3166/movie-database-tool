const express = require("express");
const router = express.Router();
const pool = require("../db");
router.get("/", async (req, res) => {
  const year = req.query.year ? parseInt(req.query.year, 10) : null;

  if (req.query.year && isNaN(year)) {
    return res.status(400).json({ error: "Year must be a number" });
  }

  try {
    let query = `
      SELECT
        movie_id,
        title,
        release_date,
        runtime,
        budget,
        revenue
      FROM movies
      WHERE 1=1
    `;

    const values = [];

    if (year) {
      values.push(year);
      query += ` AND EXTRACT(YEAR FROM release_date) = $${values.length}`;
    }

    query += `
      ORDER BY release_date DESC NULLS LAST
      LIMIT 20
    `;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch movies" });
  }
});

module.exports = router;
