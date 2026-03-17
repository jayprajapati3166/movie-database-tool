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
    const root = document.documentElement;
    const theme = isDark ? 'dark' : 'light';

    root.classList.toggle('dark', isDark);
    root.style.colorScheme = theme;
    localStorage.setItem('theme', theme);

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', isDark ? '#1b1f2a' : '#e9edf3');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((value) => !value);
  const handleDataSourceChange = (event) => {
    const nextSource = setDataSource(event.target.value);
    setDataSourceState(nextSource);
  };

  return (
    <nav className="border-b border-border/80 bg-card/90 shadow-sm shadow-black/[0.03] backdrop-blur supports-[backdrop-filter]:bg-card/75 dark:shadow-black/20">
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
                  `rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent/70 hover:text-foreground'
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
            className="h-9 rounded-md border border-border bg-background/80 px-3 text-sm text-foreground shadow-sm transition-colors hover:border-foreground/20 hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Data source"
          >
            <option value="auto">Auto</option>
            <option value="mock">Mock</option>
            <option value="backend">Backend</option>
          </select>
          <button
            type="button"
            onClick={toggleTheme}
            className="group inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background/80 text-foreground shadow-sm transition-colors hover:border-foreground/20 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? (
              <Sun size={18} className="transition-transform duration-200 group-hover:rotate-12" />
            ) : (
              <Moon size={18} className="transition-transform duration-200 group-hover:-rotate-12" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;