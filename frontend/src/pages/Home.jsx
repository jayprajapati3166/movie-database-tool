import { useEffect, useState } from 'react';
import { getMovies } from '../features/movies/api';
import MovieCard from '../components/MovieCard';
import Navbar from '../components/Navbar';

function Home() {
  const [movies, setMovies] = useState([]);
  const [filters, setFilters] = useState({
    title: '',
    year: '',
    sortBy: "newest"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      setError('');

      try {
        const result = await getMovies({
          title: filters.title,
          year: filters.year,
          page: 1,
          limit: 20,
          sortBy: 'release_date',
          order: 'desc',
        });

        setMovies(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        console.error('Failed to fetch movies:', err);
        setError('Failed to fetch movies from backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const filteredMovies = useMemo(() => {
    let result = allMovies.filter(movie => {
      if (filters.title && !movie.title.toLowerCase().includes(filters.title.toLowerCase())) return false;
      if (filters.year && movie.year != filters.year) return false;
      // Budget not in mocks, skip
      return true;
    });

    /* Sorting the dropdown menu based on the filter picked */

    if (filters.sortBy === "newest") {
      result.sort((a, b) => b.year - a.year);
  }

    if (filters.sortBy === "oldest") {
      result.sort((a, b) => a.year - b.year);
  }

    if (filters.sortBy === "az") {
      result.sort((a, b) => a.title.localeCompare(b.title));
  }

  return result;

  }, [allMovies, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  /* Prevent page loading with error message on start up */
  const hasActiveFilters = filters.title || filters.year;

  return (
    <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
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
            <input
              type="number"
              placeholder="Year"
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="w-36 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-black dark:text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />

            {/* Dropdown menu for newest, oldest and A-Z */}
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="w-40 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-black dark:text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.movie_id} movie={movie} />
            ))}
          </div>

        ) : (

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {filteredMovies.map(movie => (
      <MovieCard key={movie.id} movie={movie} />
    ))}
  </div>

)}
      </div>
    </div>
  );
}

export default Home;
