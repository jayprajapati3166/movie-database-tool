import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchMoviePoster } from '../lib/tmdbService';

function MovieCard({ movie }) {
  const [posterUrl, setPosterUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const movieId = movie.movie_id ?? movie.id;
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : movie.year;
  const rating = movie.avg_rating ?? movie.rating;

  useEffect(() => {
    const loadPoster = async () => {
      setIsLoading(true);
      setPosterUrl(null);

      try {
        const url = await fetchMoviePoster(movie.title, year);
        setPosterUrl(url);
      } catch {
        console.error('Failed to load poster for:', movie.title);
        setPosterUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadPoster();
  }, [movie.title, year]);

  return (
    <Link
      to={`/movies/${movieId}`}
      className="group block h-full rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Open details for ${movie.title}`}
    >
      <article className="surface-panel h-full p-4 transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/25 group-hover:shadow-md md:p-5">
        <div className="relative mb-4 flex aspect-[2/3] w-full items-center justify-center overflow-hidden rounded-lg bg-muted">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : posterUrl ? (
            <>
              <div
                className="absolute inset-0 scale-110 bg-cover bg-center blur-sm"
                style={{ backgroundImage: `url(${posterUrl})` }}
              />
              <img
                src={posterUrl}
                alt={`${movie.title} poster`}
                className="relative h-full w-full rounded-lg object-contain transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </>
          ) : (
            <div className="text-center text-muted-foreground">
              <div className="text-sm">No Image</div>
            </div>
          )}
        </div>
        <h3 className="line-clamp-2 text-base font-semibold leading-tight text-card-foreground md:text-lg">{movie.title}</h3>
        <div className="mt-3 flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>Year: {year ?? 'N/A'}</span>
          {rating != null ? (
            <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              {rating}/10
            </span>
          ) : null}
        </div>
      </article>
    </Link>
  );
}

export default MovieCard;
