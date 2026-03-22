import { useEffect, useState } from 'react';
import { ChevronDown, Clock3, Moon, Sun } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { getDataSource, setDataSource } from '@/features/movies/api';
import { getRecentlyViewedMovies, onRecentlyViewedChanged } from '@/features/movies/recentlyViewed';

function Navbar() {
  const [dataSource, setDataSourceState] = useState(() => getDataSource());
  const [recentlyViewedCount, setRecentlyViewedCount] = useState(() => getRecentlyViewedMovies().length);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme');

      if (storedTheme === 'light') {
        return false;
      }

      if (storedTheme === 'dark') {
        return true;
      }

      return true;
    }
    return true;
  });

  useEffect(() => {
    const root = document.documentElement;
    const theme = isDark ? 'dark' : 'light';

    root.classList.toggle('dark', isDark);
    root.style.colorScheme = theme;
    localStorage.setItem('theme', theme);

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', isDark ? '#170d34' : '#f3edff');
    }
  }, [isDark]);

  useEffect(() => {
    const syncRecentlyViewedCount = () => {
      setRecentlyViewedCount(getRecentlyViewedMovies().length);
    };

    return onRecentlyViewedChanged(syncRecentlyViewedCount);
  }, []);

  const toggleTheme = () => setIsDark((value) => !value);
  const handleDataSourceChange = (event) => {
    const nextSource = setDataSource(event.target.value);
    setDataSourceState(nextSource);
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-border/70 bg-background/92 shadow-[0_20px_60px_-32px_rgba(0,0,0,0.85)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/78">
      <div className="mx-auto flex w-full max-w-[90rem] flex-wrap items-center gap-2.5 px-4 py-2.5 sm:px-6">
        <Link
          to="/"
          className="group flex items-center gap-3 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-extrabold uppercase tracking-[0.24em] text-primary-foreground shadow-[0_16px_35px_-22px_rgba(112,79,255,0.7)]">
            MD
          </span>
          <span className="hidden min-[440px]:block text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
            Movie Database Project
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <ul className="flex items-center gap-2 sm:gap-3">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `inline-flex h-9 items-center rounded-full border px-3.5 text-[0.68rem] font-semibold uppercase tracking-[0.24em] transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-primary/70 bg-primary text-primary-foreground shadow-[0_16px_30px_-22px_rgba(112,79,255,0.7)]'
                      : 'border-border/70 bg-card/70 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`
                }
                end
              >
                Home
              </NavLink>
            </li>
            {recentlyViewedCount > 0 ? (
              <li>
                <NavLink
                  to="/recently-viewed"
                  className={({ isActive }) =>
                    `inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[0.68rem] font-semibold uppercase tracking-[0.24em] transition-colors whitespace-nowrap ${
                      isActive
                        ? 'border-primary/70 bg-primary text-primary-foreground shadow-[0_16px_30px_-22px_rgba(112,79,255,0.7)]'
                        : 'border-border/70 bg-card/70 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    }`
                  }
                >
                  <Clock3 className="size-3.5" />
                  Recent
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-background/18 px-1.5 py-0.5 text-[0.62rem] tracking-[0.2em]">
                    {recentlyViewedCount}
                  </span>
                </NavLink>
              </li>
            ) : null}
          </ul>
          <div className="relative">
            <select
              value={dataSource}
              onChange={handleDataSourceChange}
              className="h-9 appearance-none rounded-full border border-border/70 bg-card/75 px-3.5 pr-9 text-xs font-medium text-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Data source"
            >
              <option value="auto">Auto</option>
              <option value="mock">Mock</option>
              <option value="backend">Backend</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/75 text-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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