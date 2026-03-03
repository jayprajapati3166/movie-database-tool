function toQueryString(filters = {}) {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      params.set(key, String(value))
    }
  })

  return params.toString()
}

export async function getMovies(filters = {}) {
  const query = toQueryString(filters)
  const url = query ? `/api/movies?${query}` : "/api/movies"

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch movies (${res.status})`)
  }

  return res.json()
}

export async function getMovie(id) {
  const res = await fetch(`/api/movies/${id}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch movie (${res.status})`)
  }

  return res.json()
}
