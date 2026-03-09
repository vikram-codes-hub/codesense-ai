const Redis = require("ioredis");
const logger = require("../utils/logger");

const isProduction = process.env.NODE_ENV === "production";

const redisConfig = isProduction
  ? {
      username: "default",
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
    }
  : {
      host: "localhost",
      port: 6379,
    };

const redis = new Redis({
  ...redisConfig,
  retryStrategy: (times) => {
    if (times > 5) {
      logger.error("Redis: max retries reached, giving up");
      return null;
    }
    return Math.min(times * 200, 2000);
  },
});

redis.on("connect", () =>
  logger.info(
    `Redis connected — ${isProduction ? "Redis Cloud" : "localhost"}`,
  ),
);
redis.on("error", (err) => logger.error(`Redis error: ${err.message}`));

module.exports = redis;
