const RUNTIME_MODES = new Set(['demo', 'production']);

/**
 * This is intentionally the only public runtime setting. Vite exposes every
 * VITE_* value to the browser, so it must never contain credentials or tokens.
 */
export function getRuntimeMode(value = import.meta.env.VITE_GHOST_GUARDIAN_RUNTIME) {
  return RUNTIME_MODES.has(value) ? value : 'demo';
}

export const runtimeConfig = Object.freeze({
  mode: getRuntimeMode(),
  isDemo: getRuntimeMode() === 'demo',
  hasProductionServices: false,
});

