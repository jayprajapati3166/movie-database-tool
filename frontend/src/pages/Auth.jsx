import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { clearCurrentUser, getCurrentUser, loginWithGoogleCredential, onAuthChanged } from '@/features/auth/authStore';

/** Google OAuth Web client ID (public). Change here if you rotate credentials. */
const GOOGLE_CLIENT_ID = '1084030398033-ajd6g1crteo3ke23q1rm7p78iveir7f0.apps.googleusercontent.com';

function loadGoogleIdentityScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Not in browser'));
  if (window.google?.accounts?.id) return Promise.resolve();

  const existing = document.querySelector('script[data-google-identity="true"]');
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Identity script.')), {
        once: true,
      });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity script.'));
    document.head.appendChild(script);
  });
}

function useIsDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === 'undefined') return true;
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const root = document.documentElement;
    const sync = () => setIsDark(root.classList.contains('dark'));
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

export default function Auth() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | ready
  const [user, setUser] = useState(() => getCurrentUser());
  const isDark = useIsDarkMode();
  const [buttonEl, setButtonEl] = useState(null);
  const renderedThemeRef = useRef(null);

  const clientId = GOOGLE_CLIENT_ID.trim();

  useEffect(() => {
    return onAuthChanged(() => setUser(getCurrentUser()));
  }, []);

  const isSignedIn = Boolean(user?.provider === 'google' && user?.sub);

  const canShowButton = Boolean(clientId) && Boolean(buttonEl) && !isSignedIn;

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!canShowButton) return;

      setError('');
      setStatus('loading');
      try {
        await loadGoogleIdentityScript();
        if (cancelled) return;

        if (!window.google?.accounts?.id) {
          throw new Error('Google Identity Services unavailable.');
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            try {
              const nextUser = loginWithGoogleCredential(response.credential);
              setUser(nextUser);
              navigate('/', { replace: true });
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to sign in.');
            }
          },
        });

        const themeKey = isDark ? 'dark' : 'light';
        const shouldRender = renderedThemeRef.current !== themeKey;

        if (buttonEl && shouldRender) {
          buttonEl.innerHTML = '';
          window.google.accounts.id.renderButton(buttonEl, {
            theme: isDark ? 'filled_black' : 'outline',
            size: 'large',
            type: 'standard',
            text: 'continue_with',
            shape: 'pill',
            width: 320,
          });
          renderedThemeRef.current = themeKey;
        }

        setStatus('ready');
      } catch (err) {
        setStatus('idle');
        setError(err instanceof Error ? err.message : 'Failed to initialize Google Sign-In.');
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [buttonEl, canShowButton, clientId, isDark, navigate]);

  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const logoutConfirmTimerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(logoutConfirmTimerRef.current);
  }, []);

  const handleLogoutClick = () => {
    if (!logoutConfirm) {
      setLogoutConfirm(true);
      clearTimeout(logoutConfirmTimerRef.current);
      logoutConfirmTimerRef.current = setTimeout(() => setLogoutConfirm(false), 4000);
      return;
    }
    clearTimeout(logoutConfirmTimerRef.current);
    setLogoutConfirm(false);
    setError('');
    clearCurrentUser();
    renderedThemeRef.current = null;
  };

  return (
    <div className="mx-auto max-w-3xl py-10 sm:py-12">
      <section className="surface-panel relative overflow-hidden px-6 py-6 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(131,92,246,0.18),transparent_46%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_60%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(147,112,255,0.24),transparent_46%),linear-gradient(135deg,rgba(255,255,255,0.03),transparent_56%)]" />
        <div className="relative space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <span className="eyebrow">Account</span>
              <h1 className="text-3xl leading-none sm:text-4xl">Sign in with Google</h1>
              <p className="max-w-prose text-sm text-muted-foreground sm:text-base">
                Google OAuth only. No passwords.
              </p>
            </div>
          </div>
          {isSignedIn ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt=""
                    className="h-10 w-10 rounded-full border border-border/70 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full border border-border/70 bg-background/70" />
                )}
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground">{user.name ?? 'Signed in'}</div>
                  <div className="truncate text-xs text-muted-foreground">{user.email ?? ''}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogoutClick}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border px-6 text-sm font-semibold transition ${
                  logoutConfirm
                    ? 'border-destructive/40 bg-destructive/10 text-destructive hover:border-destructive/60'
                    : 'border-border/70 bg-card/70 text-foreground hover:border-primary/40 hover:bg-accent'
                }`}
              >
                <LogOut className="size-4 shrink-0" />
                {logoutConfirm ? 'Tap again to sign out' : 'Logout'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {!clientId ? (
                <div className="rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  Missing Google client id. Set <span className="font-mono">GOOGLE_CLIENT_ID</span> at the top of{' '}
                  <span className="font-mono">Auth.jsx</span>.
                </div>
              ) : null}

              {error ? (
                <div className="rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <div className="relative z-10 rounded-3xl border border-border/70 bg-card/70 px-5 py-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Continue</div>
                    <div className="mt-1 text-sm text-foreground">Use your Google account to sign in.</div>
                  </div>
                  <div className="h-px w-full bg-border/60 sm:hidden" aria-hidden="true" />
                  <div className="relative z-10 flex w-full justify-center sm:w-auto">
                    <div
                      ref={(node) => {
                        setButtonEl(node);
                      }}
                      className="relative z-10"
                    />
                  </div>
                </div>
                {status === 'loading' ? (
                  <p className="mt-3 text-center text-xs text-muted-foreground">Loading Google Sign-In…</p>
                ) : null}
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Want to go back?{' '}
            <Link to="/" className="font-semibold text-foreground underline decoration-border/70 underline-offset-4 hover:decoration-primary/50">
              Return to Home
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
