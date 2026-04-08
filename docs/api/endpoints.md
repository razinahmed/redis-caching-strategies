# Redis Caching Strategies API

## Cache Management Endpoints

### `GET /api/v1/cache/:key`
Retrieve a cached value by key using the configured caching pattern (cache-aside by default).

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `pattern` | string | Override cache pattern (`aside`, `read-through`) |

**Response 200:** `{ "key": "user:42", "value": { "name": "Alice" }, "ttl": 285, "hit": true }`
**Response 404:** `{ "key": "user:42", "hit": false }`

### `PUT /api/v1/cache/:key`
Write a value to the cache. When `writeThrough` is enabled, also persists to the backing store.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `value` | any | yes | The value to cache |
| `ttl` | number | no | Time-to-live in seconds (default: 300) |
| `writeThrough` | boolean | no | Also write to backing store |

**Response 200:** `{ "key": "user:42", "stored": true, "ttl": 300 }`

### `DELETE /api/v1/cache/:key`
Invalidate a single cache entry.

**Response 200:** `{ "key": "user:42", "deleted": true }`

### `POST /api/v1/cache/invalidate`
Bulk-invalidate cache entries matching a pattern.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `pattern` | string | yes | Glob pattern (e.g., `user:*`) |

**Response 200:** `{ "pattern": "user:*", "deletedCount": 14 }`

### `GET /api/v1/cache/stats`
Return cache hit/miss statistics and memory usage.

**Response 200:**
```json
{
  "hits": 12840,
  "misses": 320,
  "hitRate": 0.976,
  "memoryUsedBytes": 4521984,
  "totalKeys": 1523
}
```

### `GET /api/v1/health`
Returns `{ "status": "ok", "redis": "connected" }` when the Redis connection is live.

## Authentication
All endpoints require a valid API key passed via the `X-API-Key` header. The `/health` endpoint is public.
