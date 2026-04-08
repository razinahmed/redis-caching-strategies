const express = require('express');
const getOrSetCache = require('./strategies/cacheAside');
const client = require('./cache/redisClient');

const app = express();
client.connect();

app.get('/api/users', async (req, res) => {
  const users = await getOrSetCache('users_list', async () => {
     // Simulate expensive database query
     return [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }];
  });
  res.json(users);
});

app.listen(3000, () => console.log('Server running on port 3000'));