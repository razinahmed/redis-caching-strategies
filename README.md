<div align="center">

<img src="https://placehold.co/900x250/0d1117/ff6b6b?text=Redis+Caching+Strategies&font=montserrat" alt="Redis Caching Strategies Banner" width="100%" />

# Redis Caching Strategies

**Advanced distributed caching patterns in Node.js — cache-aside, write-through, read-through, pub/sub messaging, session management, and rate limiting with Redis**

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Project Structure](#-project-structure) · [API Reference](#-api-reference) · [Contributing](#-contributing) · [License](#-license)

</div>

---

## Overview

A comprehensive reference implementation of distributed caching strategies using Redis and Node.js. Each pattern is fully documented with TypeScript type safety, unit tests, and Docker-based development environments. Ideal for learning and integrating production-grade caching into your applications.

## Features

| Feature | Description |
|---------|-------------|
| **Cache-Aside Pattern** | Lazy-loading cache with on-demand population from the data source |
| **Write-Through Cache** | Synchronous writes to both cache and database for consistency |
| **Read-Through Cache** | Transparent cache layer that auto-fetches on cache miss |
| **Pub/Sub Messaging** | Real-time event broadcasting across distributed services |
| **Session Store** | Scalable session management with automatic expiration |
| **Rate Limiter** | Token bucket and sliding window rate limiting middleware |
| **Cache Invalidation** | Pattern-based and event-driven cache invalidation strategies |
| **TTL Management** | Intelligent time-to-live policies with jitter to prevent stampedes |

## Tech Stack

<div align="center">

| Technology | Purpose |
|:----------:|:-------:|
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white) | Runtime |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) | Type Safety |
| ![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white) | Cache Layer |
| ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white) | Containerization |
| ![Jest](https://img.shields.io/badge/Jest-C21325?style=flat-square&logo=jest&logoColor=white) | Testing |

</div>

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18.0
- [Redis](https://redis.io/docs/getting-started/) >= 7.0
- [Docker](https://docs.docker.com/get-docker/) >= 20.10 (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/razinahmed/redis-caching-strategies.git
cd redis-caching-strategies

# Install dependencies
npm install

# Start Redis via Docker
docker compose up -d redis

# Run the development server
npm run dev
```

### Quickstart

```bash
# Run all caching strategy demos
npm run demo

# Run a specific strategy
npm run demo:cache-aside
npm run demo:write-through
npm run demo:pub-sub

# Run tests
npm test
```

## Project Structure

```
redis-caching-strategies/
├── src/
│   ├── strategies/
│   │   ├── cache-aside.ts        # Cache-aside pattern
│   │   ├── write-through.ts      # Write-through pattern
│   │   ├── read-through.ts       # Read-through pattern
│   │   └── index.ts              # Strategy exports
│   ├── middleware/
│   │   ├── rate-limiter.ts       # Rate limiting middleware
│   │   └── session.ts            # Session management
│   ├── pubsub/
│   │   ├── publisher.ts          # Pub/Sub publisher
│   │   └── subscriber.ts         # Pub/Sub subscriber
│   ├── utils/
│   │   ├── redis-client.ts       # Redis connection manager
│   │   ├── ttl.ts                # TTL management utilities
│   │   └── invalidation.ts       # Cache invalidation helpers
│   └── index.ts                  # Application entry point
├── tests/
│   ├── strategies/               # Strategy unit tests
│   ├── middleware/                # Middleware tests
│   └── pubsub/                   # Pub/Sub tests
├── docker-compose.yml            # Redis + App containers
├── tsconfig.json                 # TypeScript configuration
├── jest.config.ts                # Jest configuration
├── package.json
└── README.md
```

## API Reference

### Cache-Aside

```typescript
import { CacheAside } from './strategies/cache-aside';

const cache = new CacheAside({ ttl: 3600, prefix: 'user' });

// Get with automatic cache population
const user = await cache.get('user:123', async () => {
  return await db.users.findById(123);
});

// Invalidate cache entry
await cache.invalidate('user:123');
```

### Write-Through

```typescript
import { WriteThrough } from './strategies/write-through';

const cache = new WriteThrough({ ttl: 7200 });

// Write to both cache and database atomically
await cache.set('product:456', productData, async (data) => {
  return await db.products.update(456, data);
});
```

### Rate Limiter

```typescript
import { rateLimiter } from './middleware/rate-limiter';

// Apply sliding window rate limiter
app.use(rateLimiter({
  windowMs: 60000,    // 1 minute window
  maxRequests: 100,   // 100 requests per window
  keyPrefix: 'api'
}));
```

### Pub/Sub

```typescript
import { Publisher, Subscriber } from './pubsub';

// Publish cache invalidation events
await publisher.publish('cache:invalidate', { key: 'user:123' });

// Subscribe to events
subscriber.on('cache:invalidate', async ({ key }) => {
  await localCache.delete(key);
});
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-strategy`)
3. Commit your changes (`git commit -m 'feat: add new caching strategy'`)
4. Push to the branch (`git push origin feature/new-strategy`)
5. Open a Pull Request

Please include tests for any new caching patterns and update documentation accordingly.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with passion by [Razin Ahmed](https://github.com/razinahmed)**

`Redis` · `Caching` · `Node.js` · `Distributed Cache` · `Rate Limiting` · `Session Management` · `Pub/Sub`

</div>
