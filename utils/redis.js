const redis = require("redis");
const { RedisStore } = require("connect-redis");

const client = redis.createClient({ url: process.env.REDIS_URL });

const store = new RedisStore({
  client,
  prefix: "sess:",
  ttl: 3600,          // 1 hour in seconds
  
});

const connectRedis = async () => {
  client.on("error", err => console.error("Redis Client Error:", err));

  await client.connect();
  console.log("Redis connected successfully.");
};

module.exports = {  connectRedis, store,client };
