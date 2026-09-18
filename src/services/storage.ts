// In-memory + Local Storage Adapter for Wateera
// Supports Web, Expo Go, and Native without build breaks

const memoryCache = new Map<string, string>();

export const localStore = {
  getString: (key: string): string | undefined => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const item = window.localStorage.getItem(key);
        return item !== null ? item : undefined;
      } catch (e) {
        return memoryCache.get(key);
      }
    }
    return memoryCache.get(key);
  },

  setString: (key: string, value: string): void => {
    memoryCache.set(key, value);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, value);
      } catch (e) {
        // Fallback to memory
      }
    }
  },

  getObject: <T>(key: string, defaultValue: T): T => {
    try {
      const raw = localStore.getString(key);
      if (!raw) return defaultValue;
      return JSON.parse(raw) as T;
    } catch (e) {
      return defaultValue;
    }
  },

  setObject: <T>(key: string, value: T): void => {
    try {
      localStore.setString(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage error for key:', key, e);
    }
  },

  delete: (key: string): void => {
    memoryCache.delete(key);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(key);
      } catch (e) {}
    }
  },
};
