const { upsertRatingService } = require("../services/ratingService");

async function upsertRating(req, res) {
  try {
    const { userId, movieId, score } = req.body;

    const parsedUserId = parseInt(userId, 10);
    const parsedMovieId = parseInt(movieId, 10);
    const parsedScore = parseInt(score, 10);

    if (
      Number.isNaN(parsedUserId) ||
      Number.isNaN(parsedMovieId) ||
      Number.isNaN(parsedScore)
    ) {
      return res.status(400).json({ error: "userId, movieId, score must be numbers" });
    }

    if (parsedScore < 1 || parsedScore > 10) {
      return res.status(400).json({ error: "score must be between 1 and 10" });
    }

    const result = await upsertRatingService({
      userId: parsedUserId,
      movieId: parsedMovieId,
      score: parsedScore,
    });

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to save rating" });
  }
}

module.exports = { upsertRating };
