import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getMovies } from "@/features/movies/api"

export default function Home() {
  const [movies, setMovies] = useState([])

  useEffect(() => {
    getMovies().then(setMovies)
  }, [])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Movies</h1>

      <div className="space-y-2">
        {movies.map(movie => (
          <Link
            key={movie.movie_id}
            to={`/movies/${movie.movie_id}`}
            className="block p-3 border rounded hover:bg-gray-100"
          >
            <div className="font-semibold">{movie.title}</div>
            <div className="text-sm text-gray-600">
              {new Date(movie.release_date).getFullYear()}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
