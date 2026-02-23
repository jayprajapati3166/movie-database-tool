import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getMovie } from "@/features/movies/api"
import Navbar from '../components/Navbar';

export default function MovieDetails() {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)

  useEffect(() => {
    getMovie(id).then(setMovie)
  }, [id])

  if (!movie) return <div className="p-6">Loading...</div>

  return (
    <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white">
      <Navbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold">{movie.title}</h1>
        <p>Release: {movie.year}</p>
        <p>Runtime: {movie.runtime} mins</p>
        <p>Budget: ${movie.budget}</p>
        <p>Revenue: ${movie.revenue}</p>
      </div>
    </div>
  )
}
