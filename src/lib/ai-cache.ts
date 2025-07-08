/**
 * AI Response Caching System
 * Caches AI responses to improve performance and reduce API calls
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

export class AIResponseCache {
  private static cache = new Map<string, CacheEntry>();
  public static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_ENTRIES = 100;

  /**
   * Generate a cache key from flow name and input
   */
  static generateKey(flowName: string, input: any): string {
    const inputHash = JSON.stringify(input, Object.keys(input).sort());
    return `${flowName}:${btoa(inputHash).slice(0, 20)}`;
  }

  /**
   * Get cached response
   */
  static get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cached response
   */
  static set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    // Cleanup old entries if cache is full
    if (this.cache.size >= this.MAX_ENTRIES) {
      this.cleanup();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    });
  }

  /**
   * Clear all cached entries
   */
  static clear(): void {
    this.cache.clear();
  }

  /**
   * Cleanup expired entries
   */
  static cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }

    // If still too many entries, remove oldest
    if (this.cache.size >= this.MAX_ENTRIES) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = sortedEntries.slice(0, this.MAX_ENTRIES / 2);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  /**
   * Get cache statistics
   */
  static getStats(): {
    size: number;
    hitRate: number;
    oldestEntry: number;
  } {
    const entries = Array.from(this.cache.values());
    
    return {
      size: this.cache.size,
      hitRate: this.getHitRate(),
      oldestEntry: entries.length > 0 ? 
        Math.min(...entries.map(e => e.timestamp)) : 0
    };
  }

  private static hitCount = 0;
  private static missCount = 0;

  static recordHit(): void {
    this.hitCount++;
  }

  static recordMiss(): void {
    this.missCount++;
  }

  private static getHitRate(): number {
    const total = this.hitCount + this.missCount;
    return total === 0 ? 0 : (this.hitCount / total) * 100;
  }
}

/**
 * HOC for caching AI flow responses
 */
export function withAICache<T, R>(
  flowName: string,
  flowFunction: (input: T) => Promise<R>,
  options: { ttl?: number; skipCache?: boolean } = {}
) {
  return async (input: T): Promise<R> => {
    const { ttl = AIResponseCache.DEFAULT_TTL, skipCache = false } = options;
    
    if (skipCache) {
      return flowFunction(input);
    }

    const cacheKey = AIResponseCache.generateKey(flowName, input);
    
    // Try to get from cache
    const cached = AIResponseCache.get(cacheKey);
    if (cached) {
      AIResponseCache.recordHit();
      console.log(`Cache hit for ${flowName}`);
      return cached;
    }

    // Cache miss - call the actual function
    AIResponseCache.recordMiss();
    console.log(`Cache miss for ${flowName}`);
    
    try {
      const result = await flowFunction(input);
      
      // Cache the result
      AIResponseCache.set(cacheKey, result, ttl);
      
      return result;
    } catch (error) {
      console.error(`Error in ${flowName}:`, error);
      throw error;
    }
  };
}
