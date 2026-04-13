import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Clock3, KeyRound, LogOut, Moon, Sun } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { clearCurrentUser, getCurrentUser, onAuthChanged } from '@/features/auth/authStore';
import { getDataSource, setDataSource } from '@/features/movies/api';
import { getRecentlyViewedMovies, onRecentlyViewedChanged } from '@/features/movies/recentlyViewed';

function Navbar({ setFontScale}) {
  const [dataSource, setDataSourceState] = useState(() => getDataSource());
  const [recentlyViewedCount, setRecentlyViewedCount] = useState(() => getRecentlyViewedMovies().length);
  const [user, setUser] = useState(() => getCurrentUser());
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const logoutConfirmTimerRef = useRef(null);
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

  useEffect(() => {
    return onAuthChanged(() => setUser(getCurrentUser()));
  }, []);

  useEffect(() => {
    return () => clearTimeout(logoutConfirmTimerRef.current);
  }, []);

  const isSignedIn = Boolean(user?.provider === 'google' && user?.sub);
  const toggleTheme = () => setIsDark((value) => !value);
  const handleDataSourceChange = (event) => {
    const nextSource = setDataSource(event.target.value);
    setDataSourceState(nextSource);
  };

  const handleLogoutClick = () => {
    if (!logoutConfirm) {
      setLogoutConfirm(true);
      clearTimeout(logoutConfirmTimerRef.current);
      logoutConfirmTimerRef.current = setTimeout(() => setLogoutConfirm(false), 4000);
      return;
    }
    clearTimeout(logoutConfirmTimerRef.current);
    setLogoutConfirm(false);
    clearCurrentUser();
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
            {isSignedIn ? (
              <li className="flex items-center gap-2">
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt=""
                    className="hidden h-9 w-9 rounded-full border border-border/70 object-cover sm:block"
                    referrerPolicy="no-referrer"
                  />
                ) : null}
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className={`inline-flex h-9 max-w-[min(100%,14rem)] items-center gap-2 rounded-full border px-3.5 text-[0.68rem] font-semibold transition-colors whitespace-nowrap sm:max-w-none ${
                    logoutConfirm
                      ? 'border-destructive/40 bg-destructive/10 text-destructive hover:border-destructive/60'
                      : 'border-border/70 bg-card/70 uppercase tracking-[0.24em] text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  <LogOut className="size-3.5 shrink-0" />
                  <span className="truncate">{logoutConfirm ? 'Tap again to sign out' : 'Logout'}</span>
                </button>
              </li>
            ) : (
              <li>
                <NavLink
                  to="/auth"
                  className={({ isActive }) =>
                    `inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[0.68rem] font-semibold uppercase tracking-[0.24em] transition-colors whitespace-nowrap ${
                      isActive
                        ? 'border-primary/70 bg-primary text-primary-foreground shadow-[0_16px_30px_-22px_rgba(112,79,255,0.7)]'
                        : 'border-border/70 bg-card/70 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    }`
                  }
                >
                  <KeyRound className="size-3.5" />
                  Login
                </NavLink>
              </li>
            )}
          </ul>
          <div className="relative">
            <select
              value={dataSource}
              onChange={handleDataSourceChange}
              className="h-9 appearance-none rounded-full border border-border/70 bg-card/75 px-3.5 pr-9 text-xs font-medium text-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Data source"
            >
              <option value="mock">Mock</option>
              <option value="backend">Backend</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.setFontScale((s) => Math.max(s - 0.1, 0.8))}
              className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/75 text-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              A-
            </button>

            <button
              onClick={() => window.setFontScale((s) => Math.min(s + 0.1, 1.5))}
              className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/75 text-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              A+
            </button>
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