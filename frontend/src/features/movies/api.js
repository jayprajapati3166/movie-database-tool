import { movies as mockMovies } from "@/mocks/movies"

const DATA_SOURCE_KEY = "movie-data-source"
const DATA_SOURCE_CHANGED_EVENT = "movie-data-source-changed"
const VALID_DATA_SOURCES = ["mock", "backend"]
const DEFAULT_DATA_SOURCE = "backend"

function normalizeDataSource(value) {
  const source = String(value ?? "").toLowerCase()
  return VALID_DATA_SOURCES.includes(source) ? source : DEFAULT_DATA_SOURCE
}

export function getDataSource() {
  if (typeof window !== "undefined") {
    return normalizeDataSource(window.localStorage.getItem(DATA_SOURCE_KEY))
  }

  return normalizeDataSource(import.meta.env.VITE_DATA_SOURCE)
}

export function setDataSource(source) {
  const normalized = normalizeDataSource(source)

  if (typeof window === "undefined") {
    return normalized
  }

  window.localStorage.setItem(DATA_SOURCE_KEY, normalized)
  window.dispatchEvent(
    new CustomEvent(DATA_SOURCE_CHANGED_EVENT, {
      detail: { source: normalized },
    }),
  )

  return normalized
}

export function onDataSourceChanged(handler) {
  if (typeof window === "undefined") {
    return () => {}
  }

  window.addEventListener(DATA_SOURCE_CHANGED_EVENT, handler)
  return () => window.removeEventListener(DATA_SOURCE_CHANGED_EVENT, handler)
}

function toQueryString(filters = {}) {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      params.set(key, String(value))
    }
  })

  return params.toString()
}

function normalizeMovie(movie) {
  return {
    ...movie,
    movie_id: movie.movie_id ?? movie.id,
    release_date: movie.release_date ?? `${movie.year}-01-01`,
    avg_rating: movie.avg_rating ?? movie.rating,
    rating_count: movie.rating_count ?? null,
    runtime: movie.runtime ?? null,
    budget: movie.budget ?? null,
    revenue: movie.revenue ?? null,
  }
}

function getMockMovies(filters = {}) {
  const title = String(filters.title ?? "").trim().toLowerCase()
  const year = String(filters.year ?? "").trim()
  const sortBy = filters.sortBy ?? "release_date"
  const order = String(filters.order ?? "desc").toLowerCase()
  const page = Number(filters.page ?? 1)
  const limit = Number(filters.limit ?? 20)

  let data = mockMovies.map(normalizeMovie)

  if (title) {
    data = data.filter((movie) => movie.title.toLowerCase().includes(title))
  }

  if (year) {
    data = data.filter((movie) => String(movie.year) === year)
  }

  data.sort((a, b) => {
    let aValue = a[sortBy]
    let bValue = b[sortBy]

    if (sortBy === "release_date") {
      aValue = Date.parse(a.release_date)
      bValue = Date.parse(b.release_date)
    }

    if (aValue < bValue) return order === "asc" ? -1 : 1
    if (aValue > bValue) return order === "asc" ? 1 : -1
    return 0
  })

  const start = Math.max(0, (page - 1) * limit)
  const paged = data.slice(start, start + limit)

  return {
    data: paged,
    total: data.length,
    page,
    limit,
  }
}

export async function getMovies(filters = {}) {
  const dataSource = getDataSource()

  if (dataSource === "mock") {
    return getMockMovies(filters)
  }

  const query = toQueryString(filters)
  const url = query ? `/api/movies?${query}` : "/api/movies"

  try {
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Failed to fetch movies (${res.status})`)
    }

    return res.json()
  } catch {
    throw new Error("Failed to fetch movies from backend.")
  }
}

export async function getMovie(id) {
  const dataSource = getDataSource()

  if (dataSource === "mock") {
    const movie = mockMovies.find((item) => String(item.id) === String(id))

    if (!movie) {
      throw new Error(`Movie ${id} not found`)
    }

    return normalizeMovie(movie)
  }

  try {
    const res = await fetch(`/api/movies/${id}`)
    if (!res.ok) {
      throw new Error(`Failed to fetch movie (${res.status})`)
    }

    return res.json()
  } catch {
    throw new Error("Failed to fetch movie from backend.")
  }
}
