import { LRUCache, Debouncer, CacheKeyGenerator } from '../../src/services/cache';
import { vi } from 'vitest';

describe('LRUCache', () => {
  let cache: LRUCache<string, string>;

  beforeEach(() => {
    cache = new LRUCache<string, string>(3, 1000); 
  });

  it('should store and retrieve values', () => {
    cache.set('key1', 'value1');
    
    expect(cache.get('key1')).toBe('value1');
  });

  it('should return undefined for non-existent keys', () => {
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  it('should evict oldest entry when at capacity', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');
    cache.set('key4', 'value4'); 
    
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBe('value2');
    expect(cache.get('key3')).toBe('value3');
    expect(cache.get('key4')).toBe('value4');
  });

  it('should respect TTL', async () => {
    cache.set('key1', 'value1', 100); 
    
    expect(cache.get('key1')).toBe('value1');
    
    await new Promise((resolve) => setTimeout(resolve, 150));
    
    expect(cache.get('key1')).toBeUndefined();
  });

  it('should update LRU order on access', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');
    
    cache.get('key1'); 
    
    cache.set('key4', 'value4'); 
    
    expect(cache.get('key1')).toBe('value1');
    expect(cache.get('key2')).toBeUndefined();
  });

  it('should handle has() correctly', () => {
    cache.set('key1', 'value1');
    
    expect(cache.has('key1')).toBe(true);
    expect(cache.has('nonexistent')).toBe(false);
  });

  it('should delete entries', () => {
    cache.set('key1', 'value1');
    
    expect(cache.delete('key1')).toBe(true);
    expect(cache.get('key1')).toBeUndefined();
  });

  it('should clear all entries', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    
    cache.clear();
    
    expect(cache.size()).toBe(0);
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBeUndefined();
  });

  it('should cleanup expired entries', async () => {
    cache.set('key1', 'value1', 100);
    cache.set('key2', 'value2', 1000);
    
    await new Promise((resolve) => setTimeout(resolve, 150));
    
    cache.cleanup();
    
    expect(cache.size()).toBe(1);
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBe('value2');
  });
});

describe('Debouncer', () => {
  let debouncer: Debouncer;

  beforeEach(() => {
    debouncer = new Debouncer();
  });

  afterEach(() => {
    debouncer.cancelAll();
  });

  it('should debounce function calls', async () => {
    const mockFn = vi.fn();
    const debouncedFn = debouncer.debounce('test', mockFn, 100);
    
    debouncedFn('arg1');
    debouncedFn('arg2');
    debouncedFn('arg3');
    
    expect(mockFn).not.toHaveBeenCalled();
    
    await new Promise((resolve) => setTimeout(resolve, 150));
    
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('arg3');
  });

  it('should cancel debounced calls', async () => {
    const mockFn = vi.fn();
    const debouncedFn = debouncer.debounce('test', mockFn, 100);
    
    debouncedFn('arg1');
    debouncer.cancel('test');
    
    await new Promise((resolve) => setTimeout(resolve, 150));
    
    expect(mockFn).not.toHaveBeenCalled();
  });

  it('should cancel all debounced calls', async () => {
    const mockFn1 = vi.fn();
    const mockFn2 = vi.fn();
    
    const debouncedFn1 = debouncer.debounce('test1', mockFn1, 100);
    const debouncedFn2 = debouncer.debounce('test2', mockFn2, 100);
    
    debouncedFn1('arg1');
    debouncedFn2('arg2');
    
    debouncer.cancelAll();
    
    await new Promise((resolve) => setTimeout(resolve, 150));
    
    expect(mockFn1).not.toHaveBeenCalled();
    expect(mockFn2).not.toHaveBeenCalled();
  });
});

describe('CacheKeyGenerator', () => {
  it('should generate consistent keys for same inputs', () => {
    const key1 = CacheKeyGenerator.positionQuery('account1', { asset: 'BTC' }, { limit: 25 });
    const key2 = CacheKeyGenerator.positionQuery('account1', { asset: 'BTC' }, { limit: 25 });
    
    expect(key1).toBe(key2);
  });

  it('should generate different keys for different inputs', () => {
    const key1 = CacheKeyGenerator.positionQuery('account1', { asset: 'BTC' }, { limit: 25 });
    const key2 = CacheKeyGenerator.positionQuery('account1', { asset: 'ETH' }, { limit: 25 });
    
    expect(key1).not.toBe(key2);
  });

  it('should generate metrics cache keys', () => {
    const key = CacheKeyGenerator.metrics('account1', { dateFrom: 1000 });
    
    expect(key).toContain('metrics:');
    expect(key).toContain('account1');
  });

  it('should generate trade history cache keys', () => {
    const key = CacheKeyGenerator.tradeHistory('account1', {}, { limit: 25, offset: 0 });
    
    expect(key).toContain('trades:');
    expect(key).toContain('account1');
  });

  it('should generate aggregated stats cache keys', () => {
    const key = CacheKeyGenerator.aggregatedStats('account1', 'day', {});
    
    expect(key).toContain('stats:');
    expect(key).toContain('account1');
    expect(key).toContain('day');
  });
});
