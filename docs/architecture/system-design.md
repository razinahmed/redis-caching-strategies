# System Architecture -- Redis Caching Strategies

## Overview
This project demonstrates production-grade caching patterns built on Redis, including cache-aside, read-through, write-through, and write-behind. An API server fronts the cache layer and supports configurable eviction policies, TTL management, and cache invalidation.

## Components

### 1. API Server
- Express-based REST API that exposes cache CRUD operations.
- Accepts a `pattern` parameter to switch between caching strategies per request.
- Collects hit/miss counters and exposes them via the `/stats` endpoint.

### 2. Cache Manager
- Core module that implements each caching pattern as a pluggable strategy.
- **Cache-Aside:** Application reads from cache first; on miss, calls the loader function and populates the cache.
- **Read-Through:** Cache itself calls the data source on miss, transparent to the caller.
- **Write-Through:** Writes go to the cache and the backing store in the same operation; cache is only updated if the store write succeeds.
- **Write-Behind:** Writes go to the cache immediately; a background worker asynchronously flushes to the store in batches.

### 3. Eviction Engine
- Supports LRU, LFU, and random eviction strategies.
- Runs as a periodic background task that scans key access metadata stored in a Redis sorted set.
- Configurable `maxKeys` threshold per namespace.

### 4. TTL Subsystem
- Every cached key is assigned a TTL derived from the entity type (e.g., sessions get 60s, user profiles get 5m).
- Supports sliding expiry: reads reset the TTL to prevent eviction of hot keys.
- Applies jitter (configurable percentage) to prevent thundering-herd expiry spikes.

## Data Flow
```
Client --> [API Server]
              |
       [Cache Manager] ---> [Redis]
              |                 |
       [Backing Store]    [Eviction Engine]
       (Postgres/Mongo)   (sorted-set scanner)
```

1. A `GET` request arrives at the API server.
2. Cache Manager checks Redis for the key.
3. On a hit, the value is returned immediately and the access timestamp is updated for LRU tracking.
4. On a miss, the configured loader fetches from the backing store, the result is written to Redis with a TTL, and the value is returned.
5. The Eviction Engine runs every 60 seconds, removing keys that exceed the namespace capacity based on the active strategy.

## Configuration
| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_URL` | `redis://localhost:6379` | Redis connection string |
| `DEFAULT_TTL` | `300` | Default TTL in seconds |
| `MAX_KEYS` | `100000` | Max keys before eviction triggers |
| `EVICTION_STRATEGY` | `LRU` | `LRU`, `LFU`, or `random` |
| `JITTER_PERCENT` | `10` | TTL jitter to avoid stampedes |
| `WRITE_BEHIND_FLUSH_INTERVAL` | `5000` | Milliseconds between write-behind flushes |

## Failure Handling
- If Redis is unreachable, the cache manager falls back to direct backing-store reads and logs a warning.
- Write-through failures roll back the cache write to maintain consistency.
- Write-behind maintains a local buffer that is replayed once Redis recovers.
