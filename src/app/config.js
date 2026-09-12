const RUNTIME_MODES = new Set(['demo', 'production']);

/**
 * Auto-detects runtime mode. Defaults to 'production' when Supabase credentials
 * are configured (indicating a deployed environment), 'demo' otherwise.
 */
export function getRuntimeMode(value = import.meta.env.VITE_GHOST_GUARDIAN_RUNTIME) {
  if (RUNTIME_MODES.has(value)) return value;

  // Auto-detect: if Supabase is configured, this is a production deployment
  const hasSupabase = Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
  );
  return hasSupabase ? 'production' : 'demo';
}

export const runtimeConfig = Object.freeze({
  mode: getRuntimeMode(),
  isDemo: getRuntimeMode() === 'demo',
  hasProductionServices: getRuntimeMode() === 'production',
});
