const { listMovies, getMovieById } = require("../services/movieService");


async function getMovies(req, res) {
    try {
        // 1) Read query parameters

        const {
            year,
            title, minBudget, maxBudget, genres,
            actorId, actor,
            minRating, maxRating,
            page = "1", limit = "20",
            sortBy = "release_date", 
            order = "desc"
        } = req.query;

        let parsedGenres = null;


        if (genres) {
            parsedGenres = genres.split(",")
                 .map(g => parseInt(g.trim(), 10))
                    .filter(g => !isNaN(g));

                if (parsedGenres.length === 0) {
                    return res.status(400).json({ error: "Invalid genre IDs" });
                }
        }
        // 2) Validate / parse

        const filters = {
            year: year ? parseInt(year, 10) : null,
            title: title || null,
            minBudget: minBudget ? parseInt(minBudget, 10) : null,
            maxBudget: maxBudget ? parseInt(maxBudget, 10) : null,
            minRating: minRating ? parseFloat(minRating) : null,
            maxRating: maxRating ? parseFloat(maxRating) : null,
            actorId: actorId ? parseInt(actorId, 10) : null,
            actor: actor || null,
            genres: parsedGenres,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sortBy,
            order,
        };
      // basic validation
      if ((year && isNaN(filters.year)) || (minBudget && isNaN(filters.minBudget)) || (maxBudget && isNaN(filters.maxBudget)) || (actorId && isNaN(filters.actorId))) {
        return res.status(400).json({ error: "Invalid numeric filter" });
      } 

      if ((minRating && isNaN(filters.minRating)) || (maxRating && isNaN(filters.maxRating))) {
        return res.status(400).json({ error: "Invalid rating filter" });
      }

        // 3) Call service (SQL)

        const result = await listMovies(filters);

        // 4) return response

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch movies" });

    }
}

async function getMovie(req, res) {
        try {
            // 1) Read the id from the URL: /api/movies/:id
            const id = parseInt(req.params.id,10);

            // 2) Validate it (protects DB + avoids weird crashes)
            if (Number.isNaN(id)) {
                return res.status(400).json({ error: "Movie id must be a number"});
            }

            // 3) Call service (service will do the SQL)
            
            const movie = await getMovieById(id);
        
            // 4) If not found, return 404
            if(!movie) {
                return res.status(404).json({ error: "Movie not found"});
            }
        
            // 5) return the movie
            res.json(movie);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to fetch movie" });
        }
}

module.exports = { getMovies, getMovieById: getMovie };