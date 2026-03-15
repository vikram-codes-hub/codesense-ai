const Redis  = require('ioredis')
const logger = require('../utils/logger')

const redis = new Redis({
  username: 'default',
  host:     process.env.REDIS_HOST,
  port:     parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    if (times > 5) {
      logger.error('Redis: max retries reached, giving up')
      return null
    }
    return Math.min(times * 200, 2000)
  },
})

redis.on('connect', () => logger.info('Redis connected — Redis Cloud'))
redis.on('error',   (err) => logger.error(`Redis error: ${err.message}`))

module.exports = redis