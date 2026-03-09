const isProduction = process.env.NODE_ENV === 'production';

const bullmqConnection = isProduction
  ? {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
    }
  : {
      host: 'localhost',
      port: 6379,
    };

module.exports = bullmqConnection;