import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchMoviePoster } from '../lib/tmdbService';

function MovieCard({ movie }) {
  const [posterUrl, setPosterUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : movie.year;

  useEffect(() => {
    const loadPoster = async () => {
      setIsLoading(true);
      try {
        const url = await fetchMoviePoster(movie.title, year);
        setPosterUrl(url);
      } catch (error) {
        console.error('Failed to load poster for:', movie.title);
        setPosterUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadPoster();
  }, [movie.title, year]);

  return (
    <Link to={`/movies/${movie.id}`} className="block">
      <div className="bg-gray-200 dark:bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
        <div className="w-full h-64 bg-gray-700 rounded-md mb-4 flex items-center justify-center relative overflow-hidden">
          {isLoading ? (
            <div className="text-gray-400">Loading...</div>
          ) : posterUrl ? (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center filter blur-sm scale-110"
                style={{ backgroundImage: `url(${posterUrl})` }}
              />
              <img
                src={posterUrl}
                alt={`${movie.title} poster`}
                className="relative w-full h-full object-contain rounded-md"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            </>
          ) : (
            <div className="text-gray-400 text-center">
              <div className="text-4xl mb-2">🎬</div>
              <div className="text-sm">No Image</div>
            </div>
          )}
        </div>
        <h3 className="text-lg font-semibold mb-2 text-black dark:text-white">{movie.title}</h3>
        <p className="text-gray-700 dark:text-gray-300">Year: {year}</p>
        {movie.rating && <p className="text-gray-700 dark:text-gray-300">Rating: {movie.rating}/10</p>}
      </div>
    </Link>
  );
}

export default MovieCard;