const express = require("express");
const router = express.Router();
const {
    getMovies,
    getMovieById,
    getTopRatedMovies,
    getTrendingMovies,
} = require("../controllers/moviesController");

router.get("/", getMovies);
router.get("/top-rated", getTopRatedMovies);
router.get("/trending", getTrendingMovies);
router.get("/:id", getMovieById);


module.exports = router;
