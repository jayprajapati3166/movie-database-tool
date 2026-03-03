import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMovie } from "@/features/movies/api";
import Navbar from "../components/Navbar";

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!movie) return <div className="p-6">Movie not found.</div>;

  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A";

  return (
    <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white">
      <Navbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold">{movie.title}</h1>
        <p>Release Year: {releaseYear}</p>
        <p>Runtime: {movie.runtime} mins</p>
        <p>Budget: ${movie.budget}</p>
        <p>Revenue: ${movie.revenue}</p>
        <p>Average Rating: {movie.avg_rating}</p>
        <p>Rating Count: {movie.rating_count}</p>
      </div>
    </div>
  );
}
