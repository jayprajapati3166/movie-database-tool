const pool = require("../db");

async function upsertRatingService({ userId, movieId, score }) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Insert or update the rating

    const ratingRes = await client.query(`
      INSERT INTO ratings (user_id, movie_id, score, source)
      VALUES ($1, $2, $3, 'user')
      ON CONFLICT (user_id, movie_id)
      DO UPDATE SET score = EXCLUDED.score, source = 'user', updated_at = NOW()
      RETURNING rating_id, user_id, movie_id, score, created_at, updated_at;
    `, [userId, movieId, score]);

    // 2. Update movies table's average rating and rating count
    await client.query(`
      UPDATE movies m
      SET avg_rating = sub.avg_rating, rating_count = sub.rating_count
      FROM (
        SELECT l.tmdb_id, Round(AVG(r.score)::numeric, 1) AS avg_rating, COUNT(r.score)
          AS rating_count
        FROM ratings r
        JOIN movie_links l ON l.movie_lens_id = r.movie_id
        where l.tmdb_id = $1
        GROUP BY l.tmdb_id
      ) sub
      WHERE m.movie_id = sub.tmdb_id;
    `, [movieId]);

    await client.query("COMMIT");

    return ratingRes.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { upsertRatingService };


