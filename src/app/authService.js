import { ApplicationError, ErrorCode } from './errors.js';

const SESSION_KEY = 'ghost_guardian_demo_session_v1';

function getStorage(storage) {
  if (storage) return storage;
  if (typeof window === 'undefined') return null;
  return window.sessionStorage;
}

/**
 * Development-only adapter. Its session is intentionally browser-local and
 * cannot authorize a production account. Replace this adapter with a provider
 * backed ProductionAuthAdapter before enabling the production runtime.
 */
export function createDevelopmentAuthAdapter({ storage } = {}) {
  const sessionStorage = getStorage(storage);

  return {
    kind: 'development-demo',
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
 * Production authentication adapter backed by the Ghost Guardian Server API.
 */
export function createProductionAuthAdapter({ apiBaseUrl = 'http://localhost:3001' } = {}) {
  return {
    kind: 'production-server',
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

