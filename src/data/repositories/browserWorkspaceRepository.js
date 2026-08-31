const STORAGE_KEY = 'ghost-guardian-workspace';

export function createBrowserWorkspaceRepository() {
  return {
    save(state) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        console.warn('Failed to save workspace:', err);
      }
    },
    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (err) {
        console.warn('Failed to load workspace:', err);
        return null;
      }
    },
    clear() {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        console.warn('Failed to clear workspace:', err);
      }
    },
  };
}
