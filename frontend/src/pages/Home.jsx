import { useCallback, useEffect, useRef, useState } from 'react';
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

const CATALOG_PAGE_SIZE = 24;
const SHOWCASE_LIMIT = 5;

function parsePositiveInteger(value) {
  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null;
}

function parseTotalPages(result, fallbackLimit = CATALOG_PAGE_SIZE) {
  const parsedTotalPages = parsePositiveInteger(result?.totalPages);
  if (parsedTotalPages) {
    return parsedTotalPages;
  }

  const parsedTotal = Number(result?.total);
  const parsedLimit = parsePositiveInteger(result?.limit) ?? fallbackLimit;

  if (Number.isFinite(parsedTotal) && parsedTotal > 0) {
    return Math.max(1, Math.ceil(parsedTotal / parsedLimit));
  }

  return 1;
}

function Home() {
  const [showcaseMovies, setShowcaseMovies] = useState([]);
  const [catalogMovies, setCatalogMovies] = useState([]);
  const [filters, setFilters] = useState({
    title: '',
    sort: 'newest',
  });
  const [showcaseLoading, setShowcaseLoading] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogLoadingMore, setCatalogLoadingMore] = useState(false);
  const [showcaseError, setShowcaseError] = useState('');
  const [catalogError, setCatalogError] = useState('');
  const [catalogLoadMoreError, setCatalogLoadMoreError] = useState('');
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogTotalPages, setCatalogTotalPages] = useState(1);
  const [catalogTotalCount, setCatalogTotalCount] = useState(null);
  const [sourceTick, setSourceTick] = useState(0);
  const catalogRequestTokenRef = useRef(0);
  const loadMoreTriggerRef = useRef(null);

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
    let isCurrent = true;
    const requestToken = catalogRequestTokenRef.current + 1;
    catalogRequestTokenRef.current = requestToken;

    const loadCatalogMovies = async () => {
      setCatalogLoading(true);
      setCatalogLoadingMore(false);
      setCatalogError('');
      setCatalogLoadMoreError('');
      setCatalogMovies([]);
      setCatalogPage(1);
      setCatalogTotalPages(1);
      setCatalogTotalCount(null);

      try {
        const sortConfig = SORT_OPTIONS[filters.sort] ?? SORT_OPTIONS.newest;
        const result = await getMovies({
          title: filters.title.trim(),
          sortBy: sortConfig.sortBy,
          order: sortConfig.order,
          page: 1,
          limit: CATALOG_PAGE_SIZE,
        });

        if (!isCurrent || catalogRequestTokenRef.current !== requestToken) {
          return;
        }

        const firstPageMovies = Array.isArray(result.data) ? result.data : [];
        const resolvedPage = parsePositiveInteger(result.page) ?? 1;
        const parsedTotal = Number(result.total);

        setCatalogMovies(firstPageMovies);
        setCatalogPage(resolvedPage);
        setCatalogTotalPages(parseTotalPages(result, CATALOG_PAGE_SIZE));
        setCatalogTotalCount(Number.isFinite(parsedTotal) ? parsedTotal : null);
      } catch (err) {
        console.error('Failed to fetch movies:', err);
        if (!isCurrent || catalogRequestTokenRef.current !== requestToken) {
          return;
        }

        setCatalogMovies([]);
        setCatalogError('Failed to load movies from backend.');
      } finally {
        if (isCurrent && catalogRequestTokenRef.current === requestToken) {
          setCatalogLoading(false);
        }
      }
    };

    loadCatalogMovies();

    return () => {
      isCurrent = false;
    };
  }, [filters.title, filters.sort, sourceTick]);

  const loadMoreCatalogMovies = useCallback(async () => {
    const requestToken = catalogRequestTokenRef.current;

    if (catalogLoading || catalogLoadingMore || catalogPage >= catalogTotalPages) {
      return;
    }

    setCatalogLoadingMore(true);
    setCatalogLoadMoreError('');

    try {
      const sortConfig = SORT_OPTIONS[filters.sort] ?? SORT_OPTIONS.newest;
      const nextPage = catalogPage + 1;
      const result = await getMovies({
        title: filters.title.trim(),
        sortBy: sortConfig.sortBy,
        order: sortConfig.order,
        page: nextPage,
        limit: CATALOG_PAGE_SIZE,
      });

      if (catalogRequestTokenRef.current !== requestToken) {
        return;
      }

      const nextPageMovies = Array.isArray(result.data) ? result.data : [];
      const resolvedPage = parsePositiveInteger(result.page) ?? nextPage;
      const parsedTotal = Number(result.total);

      setCatalogMovies((previousMovies) => [...previousMovies, ...nextPageMovies]);
      setCatalogPage(resolvedPage);
      setCatalogTotalPages((previousTotalPages) => (
        Math.max(previousTotalPages, parseTotalPages(result, CATALOG_PAGE_SIZE))
      ));

      if (Number.isFinite(parsedTotal)) {
        setCatalogTotalCount(parsedTotal);
      }
    } catch (err) {
      console.error('Failed to fetch additional movies:', err);
      if (catalogRequestTokenRef.current !== requestToken) {
        return;
      }

      setCatalogLoadMoreError('Failed to load more titles.');
    } finally {
      if (catalogRequestTokenRef.current === requestToken) {
        setCatalogLoadingMore(false);
      }
    }
  }, [catalogLoading, catalogLoadingMore, catalogPage, catalogTotalPages, filters.sort, filters.title]);

  const catalogHasMore = catalogPage < catalogTotalPages;

  useEffect(() => {
    if (!catalogHasMore || catalogLoading || catalogLoadingMore) {
      return undefined;
    }

    if (typeof window === 'undefined' || typeof window.IntersectionObserver === 'undefined') {
      return undefined;
    }

    const trigger = loadMoreTriggerRef.current;
    if (!trigger) {
      return undefined;
    }

    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMoreCatalogMovies();
        }
      },
      {
        root: null,
        rootMargin: '260px 0px',
        threshold: 0,
      },
    );

    observer.observe(trigger);

    return () => observer.disconnect();
  }, [catalogHasMore, catalogLoading, catalogLoadingMore, loadMoreCatalogMovies]);

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
  const loadedCatalogLabel = hasSearch && Number.isFinite(catalogTotalCount)
    ? `${visibleCatalogMovies.length} of ${catalogTotalCount}`
    : `${visibleCatalogMovies.length}`;

  return (
    <div className="space-y-6 md:space-y-7">
      <section className="surface-panel relative overflow-hidden px-4 py-4 sm:px-5 md:px-6 md:py-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(131,92,246,0.22),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_58%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(147,112,255,0.24),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.03),transparent_54%)]" />
        <div className="relative space-y-3">
          <span className="eyebrow">Movie Database Project</span>
          <h1 className="max-w-3xl text-4xl leading-none sm:text-5xl md:text-6xl">
            Browse the collection with a clearer layout.
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground md:text-[0.95rem]">
            Review featured titles, refine the main catalog with search and sorting, and open any record for more detail.
          </p>
          <div className="flex flex-wrap gap-2.5 pt-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em]">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/50 px-3 py-1.5 text-foreground/85 backdrop-blur-sm">
              <Clapperboard className="size-4 text-primary" />
              All available titles
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/50 px-3 py-1.5 text-foreground/85 backdrop-blur-sm">
              <SlidersHorizontal className="size-4 text-primary" />
              {activeSortLabel}
            </span>
            {hasSearch ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-primary">
                Search term: "{filters.title.trim()}"
              </span>
            ) : null}
          </div>
        </div>
      </section>

      {showcaseLoading ? (
        <div className="surface-panel p-6 text-center text-muted-foreground">Loading featured titles...</div>
      ) : showcaseError ? (
        <div className="surface-panel p-6 text-center text-destructive">{showcaseError}</div>
      ) : featuredMovie ? (
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_280px]">
          <MovieCard movie={featuredMovie} variant="feature" />
          <div className="space-y-3">
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-1">
                <span className="eyebrow">Featured titles</span>
                <h2 className="text-2xl leading-none sm:text-3xl">Quick picks</h2>
              </div>
              <span className="rounded-full border border-border/70 bg-background/55 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {quickPickMovies.length} titles
              </span>
            </div>

            {quickPickMovies.length > 0 ? (
              quickPickMovies.map((movie) => (
                <MovieCard key={movie.movie_id ?? movie.id} movie={movie} variant="compact" />
              ))
            ) : (
              <div className="surface-panel p-4 text-sm text-muted-foreground">
                Featured titles will appear here when data is available.
              </div>
            )}
          </div>
        </section>
      ) : null}

      <section className="surface-panel px-4 py-4 sm:px-5 md:px-6 md:py-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <span className="eyebrow">Catalog controls</span>
            <h2 className="text-2xl leading-none sm:text-3xl">Search and sort the movie list.</h2>
          </div>

          <div className="grid w-full gap-3 xl:max-w-[40rem] xl:grid-cols-[minmax(0,1fr)_220px]">
            <label className="block text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
              Search titles
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search movie titles"
                  value={filters.title}
                  onChange={(e) => handleFilterChange('title', e.target.value)}
                  className="h-11 w-full rounded-full border border-border/70 bg-background/80 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                  className="h-11 w-full appearance-none rounded-full border border-border/70 bg-background/80 pl-11 pr-10 text-sm text-foreground hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

      <section className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <span className="eyebrow">{hasSearch ? 'Search results' : 'Catalog'}</span>
            <h2 className="text-2xl leading-none sm:text-3xl">
              {hasSearch ? 'Matching titles' : 'Movie list'}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {hasSearch
              ? `Loaded ${loadedCatalogLabel} matching titles sorted by ${activeSortLabel.toLowerCase()}.`
              : `Loaded ${loadedCatalogLabel} titles sorted by ${activeSortLabel.toLowerCase()}.`}
          </p>
        </div>

        {catalogLoading ? (
          <div className="surface-panel p-10 text-center text-muted-foreground">Loading movies...</div>
        ) : catalogError ? (
          <div className="surface-panel p-6 text-center text-destructive">{catalogError}</div>
        ) : visibleCatalogMovies.length === 0 ? (
          <div className="surface-panel p-6 text-center text-muted-foreground">
            {hasSearch
              ? 'No titles match the current search.'
              : catalogHasMore
                ? 'No non-featured titles in this batch yet. Load more to continue.'
                : 'All available titles are already shown above.'}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7">
              {visibleCatalogMovies.map((movie) => (
                <MovieCard key={movie.movie_id ?? movie.id} movie={movie} />
              ))}
            </div>

            {catalogHasMore ? (
              <div className="surface-panel mt-3 flex flex-col items-center gap-3 p-4 text-center">
                <div ref={loadMoreTriggerRef} className="h-1 w-full" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">
                  {catalogLoadingMore ? 'Loading more titles...' : 'Scroll to load more titles.'}
                </p>
                <button
                  type="button"
                  onClick={loadMoreCatalogMovies}
                  disabled={catalogLoadingMore}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-border/70 bg-background/70 px-5 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {catalogLoadingMore ? 'Loading...' : 'Load more'}
                </button>
              </div>
            ) : null}

            {catalogLoadMoreError ? (
              <div className="surface-panel mt-3 flex flex-col items-center gap-2 p-4 text-center">
                <p className="text-sm text-destructive">{catalogLoadMoreError}</p>
                <button
                  type="button"
                  onClick={loadMoreCatalogMovies}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10 px-5 text-sm font-semibold text-destructive transition hover:bg-destructive/15"
                >
                  Retry loading
                </button>
              </div>
            ) : null}

            {!catalogHasMore ? (
              <p className="pb-1 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground/80">
                End of catalog
              </p>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}

export default Home;
