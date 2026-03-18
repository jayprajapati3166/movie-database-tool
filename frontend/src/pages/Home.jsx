import { useEffect, useState } from 'react';
import { ChevronDown, Clapperboard, Search, SlidersHorizontal } from 'lucide-react';
import { getMovies, onDataSourceChanged } from '../features/movies/api';
import MovieCard from '../components/MovieCard';

const SORT_OPTIONS = {
  newest: { sortBy: 'release_date', order: 'desc' },
  oldest: { sortBy: 'release_date', order: 'asc' },
  az: { sortBy: 'title', order: 'asc' },
};

const SORT_LABELS = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  az: 'Alphabetical',
};

const CATALOG_LIMIT = 20;
const SHOWCASE_LIMIT = 5;

function Home() {
  const [showcaseMovies, setShowcaseMovies] = useState([]);
  const [catalogMovies, setCatalogMovies] = useState([]);
  const [filters, setFilters] = useState({
    title: '',
    sort: 'newest',
  });
  const [showcaseLoading, setShowcaseLoading] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [showcaseError, setShowcaseError] = useState('');
  const [catalogError, setCatalogError] = useState('');
  const [sourceTick, setSourceTick] = useState(0);

  useEffect(() => {
    const unsubscribe = onDataSourceChanged(() => {
      setSourceTick((value) => value + 1);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadShowcaseMovies = async () => {
      setShowcaseLoading(true);
      setShowcaseError('');

      try {
        const result = await getMovies({
          page: 1,
          limit: SHOWCASE_LIMIT,
          sortBy: SORT_OPTIONS.newest.sortBy,
          order: SORT_OPTIONS.newest.order,
        });

        setShowcaseMovies(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        console.error('Failed to fetch featured movies:', err);
        setShowcaseMovies([]);
        setShowcaseError('Failed to load featured titles.');
      } finally {
        setShowcaseLoading(false);
      }
    };

    loadShowcaseMovies();
  }, [sourceTick]);

  useEffect(() => {
    const loadCatalogMovies = async () => {
      setCatalogLoading(true);
      setCatalogError('');

      try {
        const sortConfig = SORT_OPTIONS[filters.sort] ?? SORT_OPTIONS.newest;
        const result = await getMovies({
          title: filters.title.trim(),
          page: 1,
          limit: CATALOG_LIMIT,
          sortBy: sortConfig.sortBy,
          order: sortConfig.order,
        });

        setCatalogMovies(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        console.error('Failed to fetch movies:', err);
        setCatalogMovies([]);
        setCatalogError('Failed to load movies from backend.');
      } finally {
        setCatalogLoading(false);
      }
    };

    loadCatalogMovies();
  }, [filters.title, filters.sort, sourceTick]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const hasSearch = filters.title.trim().length > 0;
  const featuredMovie = showcaseMovies[0] ?? null;
  const quickPickMovies = showcaseMovies.slice(1, SHOWCASE_LIMIT);
  const activeSortLabel = SORT_LABELS[filters.sort] ?? SORT_LABELS.newest;
  const showcaseMovieIds = new Set(
    showcaseMovies.map((movie) => String(movie.movie_id ?? movie.id)),
  );
  const visibleCatalogMovies = hasSearch
    ? catalogMovies
    : catalogMovies.filter((movie) => !showcaseMovieIds.has(String(movie.movie_id ?? movie.id)));

  return (
    <div className="space-y-8 md:space-y-10">
      <section className="surface-panel relative overflow-hidden px-5 py-6 sm:px-6 md:px-8 md:py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(131,92,246,0.22),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_58%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(147,112,255,0.24),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.03),transparent_54%)]" />
        <div className="relative space-y-4">
          <span className="eyebrow">Movie Database Project</span>
          <h1 className="max-w-3xl text-5xl leading-none sm:text-6xl md:text-7xl">
            Browse the collection with a clearer layout.
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
            Review featured titles, refine the main catalog with search and sorting, and open any record for more detail.
          </p>
          <div className="flex flex-wrap gap-3 pt-2 text-xs font-semibold uppercase tracking-[0.24em]">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/50 px-4 py-2 text-foreground/85 backdrop-blur-sm">
              <Clapperboard className="size-4 text-primary" />
              Up to {CATALOG_LIMIT} titles per load
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/50 px-4 py-2 text-foreground/85 backdrop-blur-sm">
              <SlidersHorizontal className="size-4 text-primary" />
              {activeSortLabel}
            </span>
            {hasSearch ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-primary">
                Search term: "{filters.title.trim()}"
              </span>
            ) : null}
          </div>
        </div>
      </section>

      {showcaseLoading ? (
        <div className="surface-panel p-10 text-center text-muted-foreground">Loading featured titles...</div>
      ) : showcaseError ? (
        <div className="surface-panel p-10 text-center text-destructive">{showcaseError}</div>
      ) : featuredMovie ? (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_360px]">
          <MovieCard movie={featuredMovie} variant="feature" />
          <div className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-1">
                <span className="eyebrow">Featured titles</span>
                <h2 className="text-3xl leading-none sm:text-4xl">Quick picks</h2>
              </div>
              <span className="rounded-full border border-border/70 bg-background/55 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                {quickPickMovies.length} titles
              </span>
            </div>

            {quickPickMovies.length > 0 ? (
              quickPickMovies.map((movie) => (
                <MovieCard key={movie.movie_id ?? movie.id} movie={movie} variant="compact" />
              ))
            ) : (
              <div className="surface-panel p-6 text-sm text-muted-foreground">
                Featured titles will appear here when data is available.
              </div>
            )}
          </div>
        </section>
      ) : null}

      <section className="surface-panel px-5 py-5 sm:px-6 md:px-8 md:py-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <span className="eyebrow">Catalog controls</span>
            <h2 className="text-3xl leading-none sm:text-4xl">Search and sort the movie list.</h2>
          </div>

          <div className="grid w-full gap-4 xl:max-w-3xl xl:grid-cols-[minmax(0,1fr)_260px]">
            <label className="block text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
              Search titles
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search movie titles"
                  value={filters.title}
                  onChange={(e) => handleFilterChange('title', e.target.value)}
                  className="h-12 w-full rounded-full border border-border/70 bg-background/80 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </label>

            <label className="block text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
              Sort order
              <div className="relative mt-2">
                <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="h-12 w-full appearance-none rounded-full border border-border/70 bg-background/80 pl-11 pr-10 text-sm text-foreground hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Sort movies"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="az">A-Z</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </label>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <span className="eyebrow">{hasSearch ? 'Search results' : 'Catalog'}</span>
            <h2 className="text-3xl leading-none sm:text-4xl">
              {hasSearch ? 'Matching titles' : 'Movie list'}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {hasSearch
              ? `Showing ${visibleCatalogMovies.length} matching titles sorted by ${activeSortLabel.toLowerCase()}.`
              : `Showing up to ${CATALOG_LIMIT} titles sorted by ${activeSortLabel.toLowerCase()}.`}
          </p>
        </div>

        {catalogLoading ? (
          <div className="surface-panel p-10 text-center text-muted-foreground">Loading movies...</div>
        ) : catalogError ? (
          <div className="surface-panel p-10 text-center text-destructive">{catalogError}</div>
        ) : visibleCatalogMovies.length === 0 ? (
          <div className="surface-panel p-10 text-center text-muted-foreground">
            {hasSearch ? 'No titles match the current search.' : 'All available titles are already shown above.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {visibleCatalogMovies.map((movie) => (
              <MovieCard key={movie.movie_id ?? movie.id} movie={movie} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
