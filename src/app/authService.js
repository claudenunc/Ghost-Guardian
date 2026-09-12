import { ApplicationError, ErrorCode } from './errors.js';
import { getSupabaseClient } from './supabaseClient.js';

const SESSION_KEY = 'ghost_guardian_demo_session_v1';

function getStorage(storage) {
  if (storage) return storage;
  if (typeof window === 'undefined') return null;
  return window.sessionStorage;
}

/**
 * Development-only adapter. Its session is intentionally browser-local and
 * cannot authorize a production account.
 */
export function createDevelopmentAuthAdapter({ storage } = {}) {
  const sessionStorage = getStorage(storage);

  return {
    kind: 'development-demo',
    whenReady() {
      return Promise.resolve(this.getSession());
    },
    getSession() {
      try {
        const value = sessionStorage?.getItem(SESSION_KEY);
        return value ? JSON.parse(value) : null;
      } catch {
        return null;
      }
    },
    signIn() {
      const session = {
        user: { id: 'demo-creator', name: 'Alex Chen', isDemo: true },
        environment: 'demo',
      };
      sessionStorage?.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    },
    register({ name } = {}) {
      const session = {
        user: { id: 'demo-creator', name: name || 'Alex Chen', isDemo: true },
        environment: 'demo',
      };
      sessionStorage?.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    },
    signOut() {
      sessionStorage?.removeItem(SESSION_KEY);
    },
    getCurrentUser() {
      return this.getSession()?.user ?? null;
    },
    requireAuth() {
      const session = this.getSession();
      if (!session) throw new ApplicationError(ErrorCode.AUTHENTICATION, 'A demo session is required.');
      return session;
    },
  };
}

let productionToken = null;

/**
 * Legacy adapter for the local Node server. Retained for local development
 * and as the fail-closed fallback when Supabase is not configured.
 */
export function createProductionAuthAdapter({ apiBaseUrl = 'http://localhost:3001' } = {}) {
  return {
    kind: 'production-server',
    whenReady() {
      return Promise.resolve(this.getSession());
    },
    getSession() {
      if (!productionToken) return null;
      return {
        token: productionToken,
        environment: 'production',
      };
    },
    signIn(credentials = {}) {
      const { email, password } = credentials;
      if (!email || !password) {
        throw new ApplicationError(ErrorCode.AUTHENTICATION, 'Email and password are required for production sign in.');
      }

      return (async () => {
        const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new ApplicationError(ErrorCode.AUTHENTICATION, err.error || 'Invalid production credentials.');
        }

        const data = await res.json();
        productionToken = data.token;
        return {
          user: data.user,
          workspace: data.workspace,
          token: data.token,
          environment: 'production',
        };
      })();
    },
    async register({ email, password, name }) {
      const res = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new ApplicationError(ErrorCode.AUTHENTICATION, err.error || 'Registration failed.');
      }

      const data = await res.json();
      productionToken = data.token;
      return {
        user: data.user,
        workspace: data.workspace,
        token: data.token,
        environment: 'production',
      };
    },
    signOut() {
      productionToken = null;
    },
    getCurrentUser() {
      return this.getSession()?.user ?? null;
    },
    requireAuth() {
      const session = this.getSession();
      if (!session) {
        throw new ApplicationError(ErrorCode.AUTHENTICATION, 'Authentication is required to access production workspace.');
      }
      return session;
    },
  };
}

/** Turns Supabase auth errors into calm, specific sentences a creator can act on. */
export function friendlyAuthMessage(error, fallback) {
  const raw = String(error?.message || '').toLowerCase();
  if (raw.includes('invalid login credentials')) return 'That email and password do not match.';
  if (raw.includes('email not confirmed')) return 'Confirm your email first. The link is waiting in your inbox.';
  if (raw.includes('already registered') || raw.includes('already exists')) {
    return 'An account with this email already exists. Sign in instead.';
  }
  if (raw.includes('rate limit') || raw.includes('too many')) return 'Too many attempts. Give it a minute and try again.';
  if (raw.includes('password') && raw.includes('at least')) return 'Use a password with at least 6 characters.';
  if (raw.includes('invalid email') || raw.includes('valid email') || raw.includes('unable to validate email')) {
    return 'That email address does not look right.';
  }
  if (raw.includes('network') || raw.includes('failed to fetch')) {
    return 'We could not reach the sign-in service. Check your connection and try again.';
  }
  return fallback;
}

/**
 * Supabase authentication adapter for production deployments on Vercel.
 */
export function createSupabaseAuthAdapter() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    console.warn('Supabase credentials missing. Authentication is unavailable.');
    return createProductionAuthAdapter();
  }

  let cachedSession = null;
  let resolveReady;
  const ready = new Promise((resolve) => {
    resolveReady = resolve;
  });

  supabase.auth
    .getSession()
    .then(({ data }) => {
      cachedSession = data?.session || null;
      resolveReady(cachedSession);
    })
    .catch(() => resolveReady(null));

  const toSession = (session) =>
    session
      ? { user: session.user, token: session.access_token, environment: 'production' }
      : null;

  return {
    kind: 'supabase',

    /** Resolves once Supabase has restored (or ruled out) a saved session. */
    whenReady() {
      return ready;
    },

    getSession() {
      return toSession(cachedSession);
    },

    async signIn({ email, password } = {}) {
      if (!email || !password) {
        throw new ApplicationError(ErrorCode.AUTHENTICATION, 'Email and password are required.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        throw new ApplicationError(
          ErrorCode.AUTHENTICATION,
          friendlyAuthMessage(error, 'Sign in did not go through. Try again.')
        );
      }

      cachedSession = data.session;
      return toSession(data.session);
    },

    async register({ email, password, name } = {}) {
      if (!email || !password) {
        throw new ApplicationError(ErrorCode.AUTHENTICATION, 'Email and password are required.');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });

      if (error) {
        throw new ApplicationError(
          ErrorCode.AUTHENTICATION,
          friendlyAuthMessage(error, 'We could not create your account. Try again.')
        );
      }

      // Supabase returns a placeholder user with no identities when the email is already taken.
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        throw new ApplicationError(
          ErrorCode.AUTHENTICATION,
          'An account with this email already exists. Sign in instead.'
        );
      }

      cachedSession = data.session || null;
      return {
        user: data.session?.user || data.user || null,
        token: data.session?.access_token || null,
        environment: 'production',
        requiresEmailConfirmation: !data.session,
      };
    },

    async signOut() {
      const { error } = await supabase.auth.signOut();
      cachedSession = null;
      if (error) {
        console.warn('Supabase sign out error:', error.message);
      }
    },

    getCurrentUser() {
      return cachedSession?.user ?? null;
    },

    requireAuth() {
      const session = this.getSession();
      if (!session) {
        throw new ApplicationError(ErrorCode.AUTHENTICATION, 'Sign in to continue.');
      }
      return session;
    },

    onAuthStateChange(cb) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        cachedSession = session;
        cb(event, session);
      });
      return subscription;
    },
  };
}
