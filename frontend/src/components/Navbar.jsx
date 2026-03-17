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

  const toggleTheme = () => setIsDark((value) => !value);
  const handleDataSourceChange = (event) => {
    const nextSource = setDataSource(event.target.value);
    setDataSourceState(nextSource);
  };

  return (
    <nav className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-primary sm:text-xl"
        >
          Movie Database
        </Link>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <ul className="flex items-center gap-2 sm:gap-3">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `rounded-md px-2 py-1 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`
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
            className="h-9 rounded-md border bg-background px-3 text-sm text-foreground shadow-sm transition-colors hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Data source"
          >
            <option value="auto">Auto</option>
            <option value="mock">Mock</option>
            <option value="backend">Backend</option>
          </select>
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;