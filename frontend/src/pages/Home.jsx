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
    <div>
      <h1 className="text-3xl font-bold mb-8">Browse Movies</h1>

        <div className="mb-6">
          <div className="bg-gray-200 dark:bg-gray-800 rounded-xl p-3 flex gap-3 items-center shadow-sm">
            <input
              type="text"
              placeholder="Search by title..."
              value={filters.title}
              onChange={(e) => handleFilterChange('title', e.target.value)}
              className="flex-1 min-w-0 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-black dark:text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="w-40 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-black dark:text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              aria-label="Sort movies"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="az">A-Z</option>
            </select>
          </div>
        </div>
        

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : movies.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-300">
            No movies found. Try a different search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.movie_id ?? movie.id} movie={movie} />
            ))}
          </div>
        )}
    </div>
  );
}

export default Home;
