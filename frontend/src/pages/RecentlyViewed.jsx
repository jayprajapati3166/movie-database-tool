import { Clock3 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from '@/components/MovieCard';
import { getRecentlyViewedMovies, onRecentlyViewedChanged } from '@/features/movies/recentlyViewed';

function RecentlyViewed() {
  const [recentlyViewedMovies, setRecentlyViewedMovies] = useState(() => getRecentlyViewedMovies());

  useEffect(() => {
    const syncRecentlyViewedMovies = () => {
      setRecentlyViewedMovies(getRecentlyViewedMovies());
    };

    return onRecentlyViewedChanged(syncRecentlyViewedMovies);
  }, []);

  const hasRecentlyViewedMovies = recentlyViewedMovies.length > 0;
  const titleCountLabel = `${recentlyViewedMovies.length} ${recentlyViewedMovies.length === 1 ? 'title' : 'titles'}`;

  return (
    <div className="space-y-6 md:space-y-7">
      <section className="surface-panel relative overflow-hidden px-4 py-4 sm:px-5 md:px-6 md:py-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(131,92,246,0.18),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_58%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(147,112,255,0.22),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.03),transparent_54%)]" />
        <div className="relative space-y-3">
          <span className="eyebrow">Recently viewed</span>
          <h1 className="max-w-3xl text-4xl leading-none sm:text-5xl md:text-6xl">
            Pick up where you left off.
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground md:text-[0.95rem]">
            Movies you open are saved here automatically so you can jump back into their detail pages.
          </p>
          <div className="flex flex-wrap gap-2.5 pt-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em]">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/50 px-3 py-1.5 text-foreground/85 backdrop-blur-sm">
              <Clock3 className="size-4 text-primary" />
              {titleCountLabel}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/50 px-3 py-1.5 text-foreground/85 backdrop-blur-sm">
              Ordered by most recent visit
            </span>
          </div>
        </div>
      </section>

      {hasRecentlyViewedMovies ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {recentlyViewedMovies.map((movie) => (
            <MovieCard key={movie.movie_id ?? movie.id} movie={movie} />
          ))}
        </section>
      ) : (
        <section className="surface-panel p-8 text-center sm:p-10">
          <span className="eyebrow">Nothing here yet</span>
          <h2 className="mt-2 text-3xl leading-none sm:text-4xl">No recently viewed movies.</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
            Open any movie from the home catalog and this tab will appear automatically with your latest picks.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex h-11 items-center rounded-full border border-primary/30 bg-primary px-5 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-primary-foreground shadow-[0_18px_38px_-24px_rgba(112,79,255,0.7)] hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Browse movies
          </Link>
        </section>
      )}
    </div>
  );
}

export default RecentlyViewed;