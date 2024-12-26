export class CacheManager<T> {
  private cache: Map<string, {value: T, expiry?: number}> = new Map();

  set(key: string, value: T, ttl?: number): void {
    const expiry = ttl ? Date.now() + ttl * 1000 : undefined;
    this.cache.set(key, {value, expiry});
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
} 