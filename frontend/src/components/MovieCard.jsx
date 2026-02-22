import { useState, useEffect } from 'react';
import { fetchMoviePoster } from '../lib/tmdbService';

function MovieCard({ movie }) {
  const [posterUrl, setPosterUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPoster = async () => {
      setIsLoading(true);
      try {
        const url = await fetchMoviePoster(movie.title, movie.year);
        setPosterUrl(url);
      } catch (error) {
        console.error('Failed to load poster for:', movie.title);
        setPosterUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadPoster();
  }, [movie.title, movie.year]);

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
      <div className="w-full h-64 bg-gray-700 rounded-md mb-4 flex items-center justify-center">
        {isLoading ? (
          <div className="text-gray-400">Loading...</div>
        ) : posterUrl ? (
          <img
            src={posterUrl}
            alt={`${movie.title} poster`}
            className="w-full h-full object-cover rounded-md"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : (
          <div className="text-gray-400 text-center">
            <div className="text-4xl mb-2">🎬</div>
            <div className="text-sm">No Image</div>
          </div>
        )}
      </div>
      <h3 className="text-lg font-semibold mb-2">{movie.title}</h3>
      <p className="text-gray-300">Year: {movie.year}</p>
      <p className="text-gray-300">Rating: {movie.rating}/10</p>
    </div>
  );
}

export default MovieCard;