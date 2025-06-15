import { redis } from '../config/redis';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

class CacheService {
  private defaultTTL = 3600; // 1 hour in seconds
  private defaultPrefix = 'cache:';

  /**
   * Set a value in cache
   */
  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    const { ttl = this.defaultTTL, prefix = this.defaultPrefix } = options;
    const fullKey = `${prefix}${key}`;
    
    try {
      const serializedValue = JSON.stringify(value);
      await redis.set(fullKey, serializedValue, { EX: ttl });
    } catch (error) {
      console.error('Cache set error:', error);
      // Don't throw - caching errors shouldn't break the application
    }
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const { prefix = this.defaultPrefix } = options;
    const fullKey = `${prefix}${key}`;
    
    try {
      const value = await redis.get(fullKey);
      if (!value) return null;
      
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Delete a value from cache
   */
  async del(key: string, options: CacheOptions = {}): Promise<void> {
    const { prefix = this.defaultPrefix } = options;
    const fullKey = `${prefix}${key}`;
    
    try {
      await redis.del(fullKey);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Clear all cache entries with a specific prefix
   */
  async clearByPrefix(prefix: string = this.defaultPrefix): Promise<void> {
    try {
      const keys = await redis.keys(`${prefix}*`);
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Get or set cache value
   * If value is not in cache, it will be fetched using the provided function
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cachedValue = await this.get<T>(key, options);
    
    if (cachedValue !== null) {
      return cachedValue;
    }

    const value = await fetchFn();
    await this.set(key, value, options);
    return value;
  }
}

export const cacheService = new CacheService(); 