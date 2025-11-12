interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class LRUCache<K, V> {
  private cache: Map<K, CacheEntry<V>>;
  private readonly maxSize: number;
  private readonly defaultTtl: number;

  constructor(maxSize: number = 100, defaultTtl: number = 5 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtl;
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.data;
  }

  set(key: K, value: V, ttl?: number): void {
    
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTtl,
    });
  }

  has(key: K): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export class Debouncer {
  private timeouts: Map<string, NodeJS.Timeout>;

  constructor() {
    this.timeouts = new Map();
  }

  debounce<T extends (...args: any[]) => any>(
    key: string,
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      const existingTimeout = this.timeouts.get(key);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      const timeout = setTimeout(() => {
        fn(...args);
        this.timeouts.delete(key);
      }, delay);

      this.timeouts.set(key, timeout);
    };
  }

  cancelAll(): void {
    for (const timeout of this.timeouts.values()) {
      clearTimeout(timeout);
    }
    this.timeouts.clear();
  }

  cancel(key: string): void {
    const timeout = this.timeouts.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(key);
    }
  }
}

export class BatchProcessor<T, R> {
  private queue: Array<{
    item: T;
    resolve: (result: R) => void;
    reject: (error: Error) => void;
  }>;
  private timeout: NodeJS.Timeout | null;
  private readonly batchSize: number;
  private readonly batchDelay: number;
  private readonly processor: (items: T[]) => Promise<R[]>;

  constructor(
    processor: (items: T[]) => Promise<R[]>,
    batchSize: number = 10,
    batchDelay: number = 50
  ) {
    this.queue = [];
    this.timeout = null;
    this.batchSize = batchSize;
    this.batchDelay = batchDelay;
    this.processor = processor;
  }

  async add(item: T): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      this.queue.push({ item, resolve, reject });

      if (this.queue.length >= this.batchSize) {
        this.flush();
      } else {
        
        if (this.timeout) {
          clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => this.flush(), this.batchDelay);
      }
    });
  }

  private async flush(): Promise<void> {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (this.queue.length === 0) {
      return;
    }

    const batch = this.queue.splice(0, this.batchSize);
    const items = batch.map((b) => b.item);

    try {
      const results = await this.processor(items);

      batch.forEach((b, index) => {
        b.resolve(results[index]);
      });
    } catch (error) {
      
      batch.forEach((b) => {
        b.reject(error as Error);
      });
    }
  }

  queueSize(): number {
    return this.queue.length;
  }
}

export class CacheKeyGenerator {
  
  static positionQuery(account: string, filters: any, pagination: any): string {
    return `positions:${account}:${JSON.stringify(filters)}:${JSON.stringify(pagination)}`;
  }

  static metrics(account: string, filters: any): string {
    return `metrics:${account}:${JSON.stringify(filters)}`;
  }

  static tradeHistory(account: string, filters: any, pagination: any): string {
    return `trades:${account}:${JSON.stringify(filters)}:${JSON.stringify(pagination)}`;
  }

  static aggregatedStats(account: string, period: string, filters: any): string {
    return `stats:${account}:${period}:${JSON.stringify(filters)}`;
  }
}

export const performanceMetricsCache = new LRUCache<string, any>(50, 5 * 60 * 1000);
export const tradeHistoryCache = new LRUCache<string, any>(100, 3 * 60 * 1000);
export const positionDataCache = new LRUCache<string, any>(200, 10 * 60 * 1000);

export const globalDebouncer = new Debouncer();

let cleanupInterval: NodeJS.Timeout | null = null;

export function startCacheCleanup(intervalMs: number = 60 * 1000): void {
  if (cleanupInterval) {
    return; 
  }

  cleanupInterval = setInterval(() => {
    performanceMetricsCache.cleanup();
    tradeHistoryCache.cleanup();
    positionDataCache.cleanup();
  }, intervalMs);
}

export function stopCacheCleanup(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

export function clearAllCaches(): void {
  performanceMetricsCache.clear();
  tradeHistoryCache.clear();
  positionDataCache.clear();
}
