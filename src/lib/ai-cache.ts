
const cache = new Map<string, { value: any; timestamp: number }>();

export const set = (key: string, value: any) => {
  cache.set(key, { value, timestamp: Date.now() });
};

export const get = (key: string): any | null => {
  const entry = cache.get(key);
  if (!entry) return null;

  const isExpired = (Date.now() - entry.timestamp) > 3600000; // 1 hour expiry
  return isExpired ? null : entry.value;
};

export const has = (key: string): boolean => {
    return cache.has(key) && get(key) !== null;
}

export const withAICache = async <T>(key: string, fn: () => Promise<T>): Promise<T> => {
  if (has(key)) {
    return get(key) as T;
  }
  const result = await fn();
  set(key, result);
  return result;
};
