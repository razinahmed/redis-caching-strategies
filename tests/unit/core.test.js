const { CacheKeyBuilder, serializeValue, deserializeValue } = require('../../src/cache-utils');
const { EvictionPolicy } = require('../../src/eviction');
const { TTLCalculator } = require('../../src/ttl');

describe('CacheKeyBuilder', () => {
  it('should build a namespaced key from entity and id', () => {
    const key = CacheKeyBuilder.build('user', 42);
    expect(key).toBe('user:42');
  });

  it('should support composite keys with multiple segments', () => {
    const key = CacheKeyBuilder.build('org', 5, 'members');
    expect(key).toBe('org:5:members');
  });

  it('should throw when the entity name is empty', () => {
    expect(() => CacheKeyBuilder.build('', 1)).toThrow('Entity name is required');
  });

  it('should sanitize special characters from key segments', () => {
    const key = CacheKeyBuilder.build('user', 'hello world:test');
    expect(key).toBe('user:hello_world_test');
  });
});

describe('Serialization', () => {
  it('should round-trip a plain object through serialize and deserialize', () => {
    const obj = { name: 'Alice', tags: ['admin', 'active'], score: 9.5 };
    const raw = serializeValue(obj);
    expect(typeof raw).toBe('string');
    expect(deserializeValue(raw)).toEqual(obj);
  });

  it('should handle null and undefined gracefully', () => {
    expect(serializeValue(null)).toBe('null');
    expect(deserializeValue('null')).toBeNull();
    expect(serializeValue(undefined)).toBeUndefined();
  });

  it('should preserve Date objects as ISO strings', () => {
    const date = new Date('2025-06-15T10:00:00Z');
    const raw = serializeValue({ created: date });
    const parsed = deserializeValue(raw);
    expect(parsed.created).toBe('2025-06-15T10:00:00.000Z');
  });
});

describe('EvictionPolicy', () => {
  it('should evict the least-recently-used key when capacity is exceeded', () => {
    const policy = new EvictionPolicy({ maxKeys: 3, strategy: 'LRU' });
    policy.track('a');
    policy.track('b');
    policy.track('c');
    policy.track('d');
    expect(policy.shouldEvict('a')).toBe(true);
    expect(policy.shouldEvict('d')).toBe(false);
  });

  it('should evict the least-frequently-used key under LFU strategy', () => {
    const policy = new EvictionPolicy({ maxKeys: 2, strategy: 'LFU' });
    policy.track('x');
    policy.track('x');
    policy.track('y');
    policy.track('z');
    expect(policy.shouldEvict('y')).toBe(true);
    expect(policy.shouldEvict('x')).toBe(false);
  });
});

describe('TTLCalculator', () => {
  it('should return default TTL when no override is provided', () => {
    const calc = new TTLCalculator({ defaultTTL: 300 });
    expect(calc.compute('user:1')).toBe(300);
  });

  it('should apply entity-specific TTL overrides', () => {
    const calc = new TTLCalculator({ defaultTTL: 300, overrides: { session: 60 } });
    expect(calc.compute('session:abc')).toBe(60);
    expect(calc.compute('user:1')).toBe(300);
  });

  it('should add jitter when configured to prevent thundering herd', () => {
    const calc = new TTLCalculator({ defaultTTL: 300, jitterPercent: 10 });
    const ttl = calc.compute('user:1');
    expect(ttl).toBeGreaterThanOrEqual(270);
    expect(ttl).toBeLessThanOrEqual(330);
  });

  it('should clamp TTL to the configured maximum', () => {
    const calc = new TTLCalculator({ defaultTTL: 86400, maxTTL: 3600 });
    expect(calc.compute('user:1')).toBe(3600);
  });
});
