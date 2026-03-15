const bullmqConnection = {
  host:     process.env.REDIS_HOST,
  port:     parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  username: 'default',
}

module.exports = bullmqConnection