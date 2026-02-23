const express = require("express");
const router = express.Router();
const { upsertRating } = require("../controllers/ratingController");

router.post("/", upsertRating);

module.exports = router;
