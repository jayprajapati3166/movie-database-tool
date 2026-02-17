const pool = require("../db");

const ALLOWED_SORT = new Set(["release_date", "budget", "revenue", "runtime", "title"]);
const ALLOWED_ORDER = new Set(["asc", "desc"]);

async function listMovies(filters) {
    const values = [];
    let where = "WHERE 1=1";

    if (filters.year) {
        values.push(filters.year);
        where += ` AND EXTRACT(YEAR FROM release_date) = $${values.length}`;
    }

    if (filters.title) {
        values.push(`%${filters.title}%`);
        where += ` AND title ILIKE $${values.length}`;  
    }

    if (filters.minBudget != null) {
        values.push(filters.minBudget);
        where += ` AND budget::BIGINT >= $${values.length}`;
    }

    if (filters.maxBudget != null) {
        values.push(filters.maxBudget);
        where += ` AND budget::BIGINT <= $${values.length}`;
    }

    const sortBy = ALLOWED_SORT.has(filters.sortBy) ? filters.sortBy : "release_date";
    const order = ALLOWED_ORDER.has(String(filters.order).toLowerCase()) ? String(filters.order).toUpperCase() : "DESC";

    const limit = Number.isInteger(filters.limit) && filters.limit > 0 && filters.limit <= 100 ? filters.limit : 20;
    const page = Number.isInteger(filters.page) && filters.page > 0 ? filters.page : 1;
    const offset = (page -1) * limit;


    // total count for pagination 

    const countQuery = `SELECT COUNT(*)::INT AS total FROM movies ${where};`;
    const countRes = await pool.query(countQuery, values);
    const total = countRes.rows[0].total;

    // data query

    values.push (limit, offset);

    const dataQuery = `
        SELECT movie_id, title, release_date, runtime, budget, revenue
        FROM movies
        ${where}
        ORDER BY ${sortBy} ${order} NULLS LAST
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
            movie_id,
            title,
            overview,
            release_date,
            runtime,
            budget,
            revenue
            FROM movies
            WHERE movie_id = $1
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
    
    /* This quey returns One Row, but with JSON arrays for genres.actors,directors
    
    const query = `
        SELECT 
            m.movie_id, m.title, m.overview, m.release_date, m.runtime, m.budget, m.revenue,
            
            -- Genres array
            COALESCE(
                json_agg(DISTINCT jsonb_build_object(
                    'genre_id', g.genre_id,
                    'name', g.name
)) FILTER (WHERE g.genre_id IS NOT NULL),
 '[]'
) AS actors,
 
-- Directors array
COALESCE(
    json_agg(DISTINCT jsonb_build_object(
        'director_id', d.director_id,
        'name', d.name
)) FILTER (WHERE d.director_id IS NOT NULL),
 '[]'
) AS directors
 
    FROM movies m
    
    -- Genre join chain (movies -> movie_genres -> genres)
    LEFT JOIN movie_genres mg ON mg.movie_id = m.movie_id
    LEFT JOIN genres g ON g.genre_id = mg.genre_id

    -- Actor join chain (movies -> movie_actors -> actors)
    LEFT JOIN movie_actors ma ON ma.movie_id = m.movie_id
    LEFT JOIN directors d ON d.director_id = m.movie_id

    WHERE m.movie_id = $1
    GROUP BY m.movie_id
    `;

    const result = await pool.query(query, [id]);
    

//if no rows, movie doesnt ecist 
if (result.rows.length === 0) return null;
  
    return result.rows[0];
*/
module.exports = { listMovies, getMovieById};