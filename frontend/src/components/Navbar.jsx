import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { getDataSource, setDataSource } from '@/features/movies/api';

function Navbar() {
  const [dataSource, setDataSourceState] = useState(() => getDataSource());
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);
  const handleDataSourceChange = (event) => {
    const nextSource = setDataSource(event.target.value);
    setDataSourceState(nextSource);
  };

  return (
    <nav className="bg-gray-800 dark:bg-gray-900 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-white">Movie Database</Link>
        <div className="flex items-center space-x-4">
          <ul className="flex space-x-4">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? 'text-white font-semibold' : 'text-white hover:text-gray-300'
                }
                end
              >
                Home
              </NavLink>
            </li>
          </ul>
          <select
            value={dataSource}
            onChange={handleDataSourceChange}
            className="px-2 py-1 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none"
            aria-label="Data source"
          >
            <option value="auto">Auto</option>
            <option value="mock">Mock</option>
            <option value="backend">Backend</option>
          </select>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;