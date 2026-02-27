const pool = require("../db");

const ALLOWED_SORT = new Set(["release_date", "budget", "revenue", "runtime", "title", "avg_rating", "rating_count"]);
const ALLOWED_ORDER = new Set(["asc", "desc"]);

async function listMovies(filters) {
    const values = [];
    let where = "WHERE 1=1";
    let join = "";
    let ratingJoin = `
    LEFT JOIN movie_links l ON l.tmdb_id = m.movie_id
    LEFT JOIN ratings r ON r.movie_id = l.movie_lens_id
`;
    let groupBy = "GROUP BY m.movie_id";
    let having = "";

    if (filters.year) {
        values.push(filters.year);
        where += ` AND EXTRACT(YEAR FROM m.release_date) = $${values.length}`;
    }

    if (filters.title) {
        values.push(`%${filters.title}%`);
        where += ` AND m.title ILIKE $${values.length}`;
    }

    if (filters.minBudget != null) {
        values.push(filters.minBudget);
        where += ` AND m.budget >= $${values.length}`;
    }

    if (filters.maxBudget != null) {
        values.push(filters.maxBudget);
        where += ` AND m.budget <= $${values.length}`;
    }

    if (filters.genres && filters.genres.length > 0) {
        join += `
            JOIN movie_genres mg ON mg.movie_id = m.movie_id`;

            const genrePlaceholders = filters.genres
                        .map((_, i) => `$${values.length + i + 1}`).join(",");

                        values.push(...filters.genres);

                        where += ` AND mg.genre_id IN (${genrePlaceholders})`;
                        groupBy = "GROUP BY m.movie_id";
                        having = `HAVING COUNT(DISTINCT mg.genre_id) = ${filters.genres.length}`;
    }

    if (filters.actorId) {
        join += `
            JOIN movie_actors ma ON ma.movie_id = m.movie_id`;

        values.push(filters.actorId);
        where += ` AND ma.actor_id = $${values.length}`;
        groupBy = "GROUP BY m.movie_id";
    }

    if (filters.actor && !filters.actorId)
{
        join += `
            JOIN movie_actors ma ON ma.movie_id = m.movie_id
            JOIN actors a ON a.actor_id = ma.actor_id`;

            values.push(`%${filters.actor}%`);
            where += ` AND a.name ILIKE $${values.length}`;
            groupBy = "GROUP BY m.movie_id";
    }
    
    if (filters.minRating != null) {
        values.push(filters.minRating);
        if (having) {
            having += ` AND COALESCE(AVG(r.score), 0) >= $${values.length}`;     
        } else {
            having = `HAVING COALESCE(AVG(r.score), 0) >= $${values.length}`;
        }
    }

    if (filters.maxRating != null) {
        values.push(filters.maxRating);
        if (having) {
            having += ` AND AVG(r.score) <= $${values.length}`;     
        } else {
            having = `HAVING COALESCE(AVG(r.score), 0) <= $${values.length}`;
        }
    }
    const sortBy = ALLOWED_SORT.has(filters.sortBy) ? filters.sortBy : "release_date";
    const order = ALLOWED_ORDER.has(String(filters.order).toLowerCase()) ? String(filters.order).toUpperCase() : "DESC";

    const limit = Number.isInteger(filters.limit) && filters.limit > 0 && filters.limit <= 100 ? filters.limit : 20;
    const page = Number.isInteger(filters.page) && filters.page > 0 ? filters.page : 1;
    const offset = (page -1) * limit;


    // total count for pagination 

    const countQuery = `SELECT COUNT(*)::INT AS total FROM ( SELECT m.movie_id FROM movies m ${join} ${ratingJoin} ${where} ${groupBy} ${having}) sub;`;

    const countRes = await pool.query(countQuery, values);
    const total = countRes.rows[0].total;

    // data query

    values.push (limit, offset);

    const dataQuery = `
        SELECT 
          m.movie_id,
          m.title,
          m.release_date,
          m.runtime,
          m.budget,
          m.revenue,
          COALESCE(AVG(r.score), 0)::NUMERIC(3,1) AS avg_rating,
          COUNT(r.score)::INT AS rating_count


        FROM movies m
        ${join}
        ${ratingJoin}
        ${where}
        ${groupBy}
        ${having}
        ORDER BY ${sortBy === "avg_rating" ? "avg_rating" : `m.${sortBy}`} ${order} NULLS LAST
        LIMIT $${values.length -1} OFFSET $${values.length}
    `;

    const dataRes = await pool.query(dataQuery, values);

    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        data: dataRes.rows,
    };

}


async function getMovieById(id) {

    // 1) Get base movie info

    const movieQuery = `
        SELECT 
            m.movie_id,
            m.title,
            m.overview,
            m.release_date,
            m.runtime,
            m.budget,
            m.revenue,
            COALESCE(ROUND(AVG(r.score)::numeric,1), 0) AS avg_rating,
            COUNT(r.score) AS rating_count
        FROM movies m
        LEFT JOIN movie_links l ON l.tmdb_id = m.movie_id
        LEFT JOIN ratings r ON r.movie_id = l.movie_lens_id
        WHERE m.movie_id = $1
        GROUP BY m.movie_id;
            `;

            const movieRes = await pool.query(movieQuery, [id]);

            if(movieRes.rows.length === 0) return null;

            const movie = movieRes.rows[0];


            // 2) Get genres

            const genresQuery = `
                SELECT g.genre_id, g.name
                FROM movie_genres mg
                JOIN genres g ON g.genre_id = mg.genre_id
                WHERE mg.movie_id = $1
                `;

                const genresRes = await pool.query(genresQuery, [id]);

                //3) Get actors

                const actorQuery = ` 
                    SELECT a.actor_id, a.name
                    FROM movie_actors ma
                    JOIN actors a ON a.actor_id = ma.actor_id
                    WHERE ma.movie_id = $1
                    `;

                    const actorRes = await pool.query(actorQuery, [id]);

                    // 4) Get directors

                    const directorQuery = `
                    SELECT d.director_id, d.name
                    FROM movie_directors md
                    JOIN directors d ON d.director_id = md.director_id
                    WHERE md.movie_id = $1
                    `;

                    const directorsRes = await pool.query(directorQuery, [id]);

                    // 5) Combine into one object

                    return {
                        ...movie,
                        genres: genresRes.rows,
                        actors: actorRes.rows,
                        directors: directorsRes.rows,
                    };
                    }

module.exports = { listMovies, getMovieById};
