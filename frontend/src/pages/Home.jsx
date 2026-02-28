import { useEffect, useState, useMemo } from 'react';
import { getMovies } from '../features/movies/api';
import MovieCard from '../components/MovieCard';
import Navbar from '../components/Navbar';

function Home() {
  const [allMovies, setAllMovies] = useState([]);
  const [filters, setFilters] = useState({
    title: '',
    year: '',
    sortBy: "newest"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const data = await getMovies();
        setAllMovies(data);
      } catch (error) {
        console.error('Failed to fetch movies:', error);
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
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  /* Prevent page loading with error message on start up */
  const hasActiveFilters = filters.title || filters.year;

  return (
    <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Browse Movies</h1>
        
        {/* Filter logic for displaying newest release date, oldest release date or alphabetically */}
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
          <div className="text-center py-12">Loading...</div>
        
        /* If no movie is found with the search parameters an error message is displayed */
        ) : filteredMovies.length === 0 && hasActiveFilters ? (

          <div className="text-center py-12">
            <p className="text-lg font-medium">No movies found matching your search</p>
            <p className="text-gray-500 dark:text-gray-400">
              Please try a different title or year
            </p>
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
