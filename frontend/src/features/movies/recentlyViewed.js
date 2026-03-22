const RECENTLY_VIEWED_KEY = "movie-recently-viewed"
const RECENTLY_VIEWED_CHANGED_EVENT = "movie-recently-viewed-changed"
const MAX_RECENTLY_VIEWED = 12

function getMovieId(movie) {
  return movie?.movie_id ?? movie?.id ?? null
}

function normalizeRecentlyViewedMovie(movie, viewedAt = new Date().toISOString()) {
  const movieId = getMovieId(movie)

  if (movieId === null || movieId === undefined) {
    return null
  }

  const parsedReleaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : movie.year
  const year = Number.isFinite(parsedReleaseYear) ? parsedReleaseYear : (movie.year ?? null)

  return {
    ...movie,
    id: movie.id ?? movieId,
    movie_id: movieId,
    release_date: movie.release_date ?? (year ? `${year}-01-01` : null),
    year,
    avg_rating: movie.avg_rating ?? movie.rating ?? null,
    rating: movie.rating ?? movie.avg_rating ?? null,
    viewedAt: movie.viewedAt ?? viewedAt,
  }
}

function readStoredRecentlyViewedMovies() {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const storedMovies = window.localStorage.getItem(RECENTLY_VIEWED_KEY)

    if (!storedMovies) {
      return []
    }

    const parsedMovies = JSON.parse(storedMovies)

    if (!Array.isArray(parsedMovies)) {
      return []
    }

    return parsedMovies
      .map((movie) => normalizeRecentlyViewedMovie(movie, movie?.viewedAt))
      .filter(Boolean)
  } catch {
    return []
  }
}

function writeStoredRecentlyViewedMovies(movies) {
  window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(movies))
  window.dispatchEvent(
    new CustomEvent(RECENTLY_VIEWED_CHANGED_EVENT, {
      detail: { movies },
    }),
  )
}

export function getRecentlyViewedMovies() {
  return readStoredRecentlyViewedMovies()
}

export function addRecentlyViewedMovie(movie) {
  if (typeof window === "undefined") {
    return []
  }

  const normalizedMovie = normalizeRecentlyViewedMovie(movie)

  if (!normalizedMovie) {
    return readStoredRecentlyViewedMovies()
  }

  const nextMovies = [
    normalizedMovie,
    ...readStoredRecentlyViewedMovies().filter(
      (item) => String(getMovieId(item)) !== String(normalizedMovie.movie_id),
    ),
  ].slice(0, MAX_RECENTLY_VIEWED)

  writeStoredRecentlyViewedMovies(nextMovies)
  return nextMovies
}

export function onRecentlyViewedChanged(handler) {
  if (typeof window === "undefined") {
    return () => {}
  }

  const handleChange = (event) => {
    if (event?.type === "storage" && event.key !== RECENTLY_VIEWED_KEY) {
      return
    }

    handler(event)
  }

  window.addEventListener(RECENTLY_VIEWED_CHANGED_EVENT, handleChange)
  window.addEventListener("storage", handleChange)

  return () => {
    window.removeEventListener(RECENTLY_VIEWED_CHANGED_EVENT, handleChange)
    window.removeEventListener("storage", handleChange)
  }
}