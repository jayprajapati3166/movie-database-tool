import { useEffect, useState } from 'react';
import { getMovies, onDataSourceChanged } from '../features/movies/api';
import MovieCard from '../components/MovieCard';

const SORT_OPTIONS = {
  newest: { sortBy: 'release_date', order: 'desc' },
  oldest: { sortBy: 'release_date', order: 'asc' },
  az: { sortBy: 'title', order: 'asc' },
};

function Home() {
  const [movies, setMovies] = useState([]);
  const [filters, setFilters] = useState({
    title: '',
    sort: 'newest',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sourceTick, setSourceTick] = useState(0);

  useEffect(() => {
    const unsubscribe = onDataSourceChanged(() => {
      setSourceTick((value) => value + 1);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      setError('');

      try {
        const sortConfig = SORT_OPTIONS[filters.sort] ?? SORT_OPTIONS.newest;
        const result = await getMovies({
          title: filters.title,
          page: 1,
          limit: 20,
          sortBy: sortConfig.sortBy,
          order: sortConfig.order,
        });

        setMovies(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        console.error('Failed to fetch movies:', err);
        setError('Failed to fetch movies from backend.');
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, [filters.title, filters.sort, sourceTick]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold md:text-4xl">Browse Movies</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Search by title and sort results by release date or alphabetically.
        </p>
      </header>

      <section className="surface-panel p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Search by title..."
            value={filters.title}
            onChange={(e) => handleFilterChange('title', e.target.value)}
            className="h-11 w-full rounded-lg border bg-background px-4 text-sm text-foreground transition-colors placeholder:text-muted-foreground hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="h-11 w-full rounded-lg border bg-background px-4 text-sm text-foreground transition-colors hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-44"
            aria-label="Sort movies"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="az">A-Z</option>
          </select>
        </div>
      </section>

      {loading ? (
        <div className="surface-panel p-10 text-center text-muted-foreground">Loading...</div>
      ) : error ? (
        <div className="surface-panel p-10 text-center text-destructive">{error}</div>
      ) : movies.length === 0 ? (
        <div className="surface-panel p-10 text-center text-muted-foreground">
          No movies found. Try a different search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          {movies.map((movie) => (
            <MovieCard key={movie.movie_id ?? movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
