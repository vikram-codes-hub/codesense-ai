const { Server } = require('socket.io');
const logger = require('../utils/logger');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // ── Subscribe to review room ─────────────────────
    socket.on('subscribe:review', ({ reviewId }) => {
      if (!reviewId) return;
      socket.join(`review:${reviewId}`);
      logger.info(`Socket ${socket.id} joined room review:${reviewId}`);
    });

    // ── Unsubscribe from review room ─────────────────
    socket.on('unsubscribe:review', ({ reviewId }) => {
      if (!reviewId) return;
      socket.leave(`review:${reviewId}`);
      logger.info(`Socket ${socket.id} left room review:${reviewId}`);
    });

    // ── Disconnect ───────────────────────────────────
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  logger.info('Socket.IO initialized');
  return io;
};

// ── Emit Helpers ───────────────────────────────────────

const emitReviewQueued = (reviewId, data) => {
  if (!io) return;
  io.to(`review:${reviewId}`).emit('review:queued', {
    reviewId,
    ...data,
  });
};

const emitReviewStarted = (reviewId, data) => {
  if (!io) return;
  io.to(`review:${reviewId}`).emit('review:started', {
    reviewId,
    ...data,
  });
};

const emitReviewFileDone = (reviewId, data) => {
  if (!io) return;
  io.to(`review:${reviewId}`).emit('review:file:done', {
    reviewId,
    ...data,
  });
};

const emitReviewComplete = (reviewId, data) => {
  if (!io) return;
  io.to(`review:${reviewId}`).emit('review:complete', {
    reviewId,
    ...data,
  });
};

const emitReviewFailed = (reviewId, data) => {
  if (!io) return;
  io.to(`review:${reviewId}`).emit('review:failed', {
    reviewId,
    ...data,
  });
};

const emitReviewPosted = (reviewId, data) => {
  if (!io) return;
  io.to(`review:${reviewId}`).emit('review:posted', {
    reviewId,
    ...data,
  });
};

const getIO = () => io;

module.exports = {
  initSocket,
  getIO,
  emitReviewQueued,
  emitReviewStarted,
  emitReviewFileDone,
  emitReviewComplete,
  emitReviewFailed,
  emitReviewPosted,
};