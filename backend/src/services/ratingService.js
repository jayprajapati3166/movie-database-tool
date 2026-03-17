const pool = require("../db");

async function upsertRatingService({ userId, movieId, score }) {
  const query = `
    INSERT INTO ratings (user_id, movie_id, score)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, movie_id)
    DO UPDATE SET score = EXCLUDED.score, updated_at = NOW()
    RETURNING rating_id, user_id, movie_id, score, created_at, updated_at;
  `;

  const res = await pool.query(query, [userId, movieId, score]);
  return res.rows[0];
}

module.exports = { upsertRatingService };
