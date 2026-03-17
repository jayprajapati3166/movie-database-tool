import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getMovie, onDataSourceChanged } from "@/features/movies/api"
import { fetchMoviePoster, fetchMovieOverview } from "@/lib/tmdbService";

export default function MovieDetails() {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [sourceTick, setSourceTick] = useState(0)
  const [posterUrl, setPosterUrl] = useState(null);
  const [overview, setOverview] = useState("");
  const [rating, setRating] = useState(null);
  const [runtime, setRuntime] = useState(null)
  const [budget, setBudget] = useState(null)
  const [revenue, setRevenue] = useState(null)

  useEffect(() => {
    const unsubscribe = onDataSourceChanged(() => {
      setSourceTick((value) => value + 1);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadMovie = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getMovie(id);
        setMovie(data);
      } catch (err) {
        console.error("Failed to fetch movie:", err);
        setError("Failed to fetch movie from backend.");
      } finally {
        setLoading(false);
      }
    };

    loadMovie();
  }, [id, sourceTick]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const releaseYear = movie.release_date
          ? new Date(movie.release_date).getFullYear()
          : movie.year;

        const url = await fetchMoviePoster(movie.title, releaseYear);
        const data = await fetchMovieOverview(movie.title, releaseYear);

        setPosterUrl(url);
        setOverview(data?.overview ?? "No description available.");
        setRating(data?.rating ? Number(data.rating).toFixed(1) : (movie.avg_rating ?? "N/A"));
        setRuntime(data?.runtime ?? movie.runtime);
        setBudget(data?.budget ?? movie.budget);
        setRevenue(data?.revenue ?? movie.revenue);
      } catch (fetchError) {
        console.error("Fetch failed", fetchError)
      }
    };

    if (movie) {
      fetchData()
    }
  }, [movie])

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!movie) return <div className="p-6">Movie not found.</div>;

  return (
    <div className="p-2 md:p-6">
      <h1 className="text-4xl font-bold mb-6">{movie.title}</h1>
        
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
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Ratings: {movie.rating_count ?? "N/A"} votes</p>
        </section>
    </div>
  )
}
