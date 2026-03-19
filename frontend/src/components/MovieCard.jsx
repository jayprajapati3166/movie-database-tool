import { useEffect, useState } from 'react';
import { ArrowUpRight, CalendarDays, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchMoviePoster } from '../lib/tmdbService';
import { addRecentlyViewedMovie } from '@/features/movies/recentlyViewed';

function MovieCard({ movie, variant = 'default' }) {
  const [posterUrl, setPosterUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const movieId = movie.movie_id ?? movie.id;
  const parsedReleaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : movie.year;
  const year = Number.isFinite(parsedReleaseYear) ? parsedReleaseYear : (movie.year ?? 'N/A');
  const rating = movie.avg_rating ?? movie.rating;
  const numericRating = Number(rating);
  const displayRating = Number.isFinite(numericRating) ? numericRating.toFixed(1) : 'N/A';

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

  const handleMovieClick = () => {
    addRecentlyViewedMovie(movie);
  };

  return (
    <Link
      to={`/movies/${movieId}`}
      onClick={handleMovieClick}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Open details for ${movie.title}`}
    >
      {variant === 'feature' ? (
        <article className="surface-panel relative h-full min-h-[22rem] overflow-hidden p-4 sm:p-5 md:min-h-[24rem] md:p-6">
          <div className="absolute inset-0">
            {posterUrl ? (
              <>
                <div
                  className="absolute inset-0 scale-105 bg-cover bg-center opacity-40 blur-md"
                  style={{ backgroundImage: `url(${posterUrl})` }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(7,7,8,0.96),rgba(7,7,8,0.84)_46%,rgba(7,7,8,0.38))]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(147,112,255,0.24),transparent_34%)]" />
              </>
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(118,81,214,0.28),rgba(12,12,12,0.92)_42%,rgba(12,12,12,0.86))]" />
            )}
          </div>
          <div className="relative grid h-full gap-4 md:grid-cols-[184px_minmax(0,1fr)] md:items-end">
            <div className="mx-auto w-full max-w-[11.5rem] md:mx-0">
              <div className="relative flex aspect-[2/3] w-full items-center justify-center overflow-hidden rounded-[1.15rem] border border-white/12 bg-white/6 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.95)]">
                {isLoading ? (
                  <div className="text-sm text-white/65">Loading poster...</div>
                ) : posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={`${movie.title} poster`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    onError={() => setPosterUrl(null)}
                  />
                ) : (
                  <div className="px-6 text-center text-sm text-white/65">Poster unavailable</div>
                )}
              </div>
            </div>

            <div className="flex h-full flex-col justify-end text-white">
              <span className="eyebrow text-primary">Featured title</span>
              <h2 className="mt-2 max-w-3xl text-4xl leading-none sm:text-5xl md:text-6xl">{movie.title}</h2>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/78 sm:text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-1.5 backdrop-blur-sm">
                  <CalendarDays className="size-4 text-primary" />
                  {year}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-1.5 backdrop-blur-sm">
                  <Star className="size-4 fill-primary text-primary" />
                  {displayRating} / 10
                </span>
              </div>
              <p className="mt-4 max-w-2xl text-xs leading-relaxed text-white/72 sm:text-sm md:text-[0.95rem]">
                Open the record to review the release year, rating, and additional details.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-primary sm:text-xs">
                View details
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </div>
        </article>
      ) : variant === 'compact' ? (
        <article className="surface-panel overflow-hidden p-2.5 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/25 group-hover:shadow-[0_32px_80px_-46px_rgba(0,0,0,0.82)]">
          <div className="flex items-center gap-3">
            <div className="relative flex aspect-[2/3] w-16 shrink-0 items-center justify-center overflow-hidden rounded-[0.95rem] border border-border/60 bg-muted sm:w-[4.5rem]">
              {isLoading ? (
                <div className="px-2 text-center text-[0.72rem] text-muted-foreground">Loading...</div>
              ) : posterUrl ? (
                <img
                  src={posterUrl}
                  alt={`${movie.title} poster`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={() => setPosterUrl(null)}
                />
              ) : (
                <div className="px-2 text-center text-[0.72rem] text-muted-foreground">No poster</div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-primary/80">Selected title</span>
              <h3 className="mt-1.5 line-clamp-2 text-xl leading-none text-card-foreground sm:text-2xl">{movie.title}</h3>
              <div className="mt-2 flex flex-wrap gap-2 text-[0.72rem] text-muted-foreground sm:text-xs">
                <span className="rounded-full border border-border/70 bg-background/50 px-2.5 py-1">{year}</span>
                <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                  {displayRating} / 10
                </span>
              </div>
            </div>
          </div>
        </article>
      ) : (
        <article className="surface-panel h-full overflow-hidden p-2.5 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-primary/25 group-hover:shadow-[0_34px_90px_-52px_rgba(0,0,0,0.88)] md:p-3">
          <div className="relative flex aspect-[2/3] w-full items-center justify-center overflow-hidden rounded-[1rem] border border-border/60 bg-muted">
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading poster...</div>
            ) : posterUrl ? (
              <>
                <div
                  className="absolute inset-0 scale-110 bg-cover bg-center opacity-35 blur-lg"
                  style={{ backgroundImage: `url(${posterUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                <img
                  src={posterUrl}
                  alt={`${movie.title} poster`}
                  className="relative h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={() => setPosterUrl(null)}
                />
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                <div className="text-sm">No poster</div>
              </div>
            )}
          </div>

          <div className="px-1 pb-1 pt-3">
            <div className="flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-primary/80">
              <Star className="size-3.5 fill-primary text-primary" />
              Rating {displayRating}
            </div>
            <h3 className="mt-2.5 line-clamp-2 text-[1.55rem] leading-none text-card-foreground md:text-[1.7rem]">{movie.title}</h3>
            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground sm:text-sm">
              <span>{year}</span>
              <span className="inline-flex items-center gap-1 text-primary text-[0.72rem] font-medium sm:text-xs">
                View details
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </div>
        </article>
      )}
    </Link>
  );
}

export default MovieCard;
