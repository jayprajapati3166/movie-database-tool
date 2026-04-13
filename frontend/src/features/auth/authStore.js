const AUTH_STORAGE_KEY = 'movie-auth-user';
const AUTH_CHANGED_EVENT = 'movie-auth-changed';

function parseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function decodeJwtPayload(jwt) {
  const [, payload] = String(jwt).split('.');
  if (!payload) return null;

  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '=');
  const json = atob(base64);
  const bytes = Uint8Array.from(json, (c) => c.charCodeAt(0));
  return parseJson(new TextDecoder().decode(bytes));
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  const user = parseJson(raw);
  return user && typeof user === 'object' ? user : null;
}

function setCurrentUser(user) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
}

export function clearCurrentUser() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
}

export function onAuthChanged(handler) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(AUTH_CHANGED_EVENT, handler);
  return () => window.removeEventListener(AUTH_CHANGED_EVENT, handler);
}

export function loginWithGoogleCredential(credentialJwt) {
  if (typeof window === 'undefined') return null;

  const payload = decodeJwtPayload(credentialJwt);
  if (!payload) {
    throw new Error('Invalid Google credential.');
  }

  const user = {
    provider: 'google',
    sub: payload.sub ?? null,
    email: payload.email ?? null,
    emailVerified: payload.email_verified ?? null,
    name: payload.name ?? payload.given_name ?? null,
    picture: payload.picture ?? null,
    issuedAt: payload.iat ?? null,
    expiresAt: payload.exp ?? null,
  };

  setCurrentUser(user);
  return user;
}

