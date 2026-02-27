import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getMovie } from "@/features/movies/api"
import Navbar from '../components/Navbar';
import MovieCard from "@/components/MovieCard";
import { fetchMoviePoster, fetchMovieOverview } from "@/lib/tmdbService";

export default function MovieDetails() {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [posterUrl, setPosterUrl] = useState(null);
  const [overview, setOverview] = useState("");
  const [rating, setRating] = useState(null);
  const [runtime, setRuntime] = useState(null)
  const [budget, setBudget] = useState(null)
  const [revenue, setRevenue] = useState(null)
  const [isLoadingPoster, setIsLoadingPoster] = useState(true);

  useEffect(() => {
    getMovie(id).then(setMovie)
  }, [id])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = await fetchMoviePoster(movie.title, movie.year);
        const data = await fetchMovieOverview(movie.title, movie.year);
        
        setPosterUrl(url);
        setOverview(data?.overview);
        setRating(data?.rating ? Number(data.rating).toFixed(1) : "N/A");
        setRuntime(data?.runtime);
        setBudget(data?.budget);
        setRevenue(data?.revenue)
      }   
      catch(error) 
      {
        console.error("Fetch failed", error)
      }
      finally{
        setIsLoadingPoster(false)
      }
    };

    if (movie) {
      fetchData()
    }
  }, [movie])
    

  if (!movie) return <div className="p-6">Loading...</div>

  return (
    <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white">
      <Navbar />
      <div className="p-6">
        <h1 className="text-4xl font-bold mb-6 m1-40">{movie.title}</h1>
        
        <section className="p-6 flex flex-col md:flex-row gap-8 items-start">
          {posterUrl && (
            <img 
              src={posterUrl} 
              alt={`${movie.title} poster`} 
              className="w-64 rounded-lg shadow-md flex-shrink-0" 
            />
          )}
          
          <div className="space-y-3">
            <p className="text-lg font-medium text-yellow-500">
              Rating: <span className="font-normal text-black dark:text-white">{rating} / 10</span>
            </p>
            <p className="text-lg font-medium">Release: <span className="font-normal">{movie.year}</span></p>
            <p className="text-lg font-medium">Runtime: <span className="font-normal">{runtime} mins</span></p>
            <p className="text-lg font-medium">Budget: <span className="font-normal">${budget}</span></p>
            <p className="text-lg font-medium">Revenue: <span className="font-normal">${revenue}</span></p>
          </div>
        </section>

        <section className="p-6 border-t dark:border-gray-700">
          <h2 className="text-3xl font-bold mb-4">Overview</h2>
          <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">{overview}</p>
        </section>
      </div>
    </div>
  )
}