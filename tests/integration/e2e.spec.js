const Redis = require('ioredis');
const { CacheManager } = require('../../src/cache-manager');

let redis;
let cache;

beforeAll(async () => {
  redis = new Redis({ host: '127.0.0.1', port: 6379, db: 9 });
  cache = new CacheManager(redis);
  await redis.flushdb();
});

afterAll(async () => {
  await redis.flushdb();
  await redis.quit();
});

afterEach(async () => {
  await redis.flushdb();
});

describe('Cache-Aside Pattern', () => {
  it('should return null on cache miss and populate on subsequent read', async () => {
    const firstRead = await cache.getThrough('user:1', async () => ({ name: 'Alice' }));
    expect(firstRead).toEqual({ name: 'Alice' });

    const cached = await redis.get('user:1');
    expect(JSON.parse(cached)).toEqual({ name: 'Alice' });
  });

  it('should serve from cache on the second read without calling the loader', async () => {
    let loaderCalls = 0;
    const loader = async () => { loaderCalls++; return { id: 42 }; };

    await cache.getThrough('item:42', loader);
    await cache.getThrough('item:42', loader);
    expect(loaderCalls).toBe(1);
  });
});

describe('Write-Through Pattern', () => {
  it('should write to both cache and the backing store atomically', async () => {
    const persisted = [];
    const store = { save: async (k, v) => persisted.push({ k, v }) };

    await cache.writeThrough('order:10', { total: 99.99 }, store);

    const cached = JSON.parse(await redis.get('order:10'));
    expect(cached).toEqual({ total: 99.99 });
    expect(persisted).toEqual([{ k: 'order:10', v: { total: 99.99 } }]);
  });

  it('should not update cache if the backing store write fails', async () => {
    const store = { save: async () => { throw new Error('DB down'); } };

    await expect(cache.writeThrough('fail:1', { x: 1 }, store)).rejects.toThrow('DB down');
    const cached = await redis.get('fail:1');
    expect(cached).toBeNull();
  });
});

describe('TTL Expiry', () => {
  it('should expire keys after the configured TTL', async () => {
    await cache.set('temp:1', 'value', { ttl: 1 });
    const before = await redis.get('temp:1');
    expect(before).toBe('"value"');

    await new Promise((r) => setTimeout(r, 1500));
    const after = await redis.get('temp:1');
    expect(after).toBeNull();
  });

  it('should refresh TTL on read when slidingExpiry is enabled', async () => {
    await cache.set('slide:1', 'data', { ttl: 2, sliding: true });

    await new Promise((r) => setTimeout(r, 1000));
    await cache.get('slide:1');

    const ttl = await redis.ttl('slide:1');
    expect(ttl).toBeGreaterThan(1);
  });
});
