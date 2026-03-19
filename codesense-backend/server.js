require('dotenv').config()
const http      = require('http')
const app       = require('./app')
const connectDB = require('./config/db')
const redis     = require('./config/redis')
const logger    = require('./utils/logger')
const { initSocket }      = require('./socket')
const { reviewWorker }    = require('./workers/review.worker')
const { githubWorker }    = require('./workers/github.worker')
const { initReviewQueue } = require('./queues/review.queue')
const { initGithubQueue } = require('./queues/github.queue')

const PORT = process.env.PORT || 5000

const server = http.createServer(app)

const io = initSocket(server)
global.io = io

const start = async () => {
  try {
    await connectDB()

    await redis.ping()
    logger.info('Redis connected')

    // ── Init queues BEFORE workers use them ──
    initReviewQueue(redis)
    initGithubQueue(redis)

    logger.info('Workers started: review + github')

    server.listen(PORT, () => {
      logger.info('─────────────────────────────────────')
      logger.info('  🚀 CodeSense AI Backend')
      logger.info(`  Port     : ${PORT}`)
      logger.info(`  Env      : ${process.env.NODE_ENV}`)
      logger.info(`  ML URL   : ${process.env.ML_SERVICE_URL}`)
      logger.info(`  Client   : ${process.env.CLIENT_URL}`)
      logger.info('─────────────────────────────────────')
    })

  } catch (error) {
    logger.error(`Startup failed: ${error.message}`)
    process.exit(1)
  }
}

process.on('SIGTERM', async () => {
  logger.warn('SIGTERM — shutting down')
  await reviewWorker.close()
  await githubWorker.close()
  redis.disconnect()
  server.close(() => {
    logger.info('Server closed')
    process.exit(0)
  })
})

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`)
  process.exit(1)
})

start()