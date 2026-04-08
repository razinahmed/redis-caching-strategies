const client = require('../cache/redisClient');

async function getOrSetCache(key, cb) {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await client.get(key);
      if (data != null) return resolve(JSON.parse(data));

      const freshData = await cb();
      await client.setEx(key, 3600, JSON.stringify(freshData));
      resolve(freshData);
    } catch (err) {
      reject(err);
    }
  });
}
module.exports = getOrSetCache;