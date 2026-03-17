const express = require("express");
const router = express.Router();
const { getMovies, getMovieById } = require("../controllers/moviesController");

router.get("/", getMovies);
router.get("/top-rated", moviesController.getTopRatedMovies);
router.get("/trending", moviesController.getTrendingMovies);
router.get("/:id", getMovieById);


module.exports = router;
