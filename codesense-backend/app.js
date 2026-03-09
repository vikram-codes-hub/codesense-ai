require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// const authRoutes = require('./routes/auth.routes');
// const repoRoutes = require('./routes/repo.routes');
// const reviewRoutes = require('./routes/review.routes');
// const dashboardRoutes = require('./routes/dashboard.routes');
// const webhookRoutes = require('./routes/webhook.routes');

const errorMiddleware = require('./middleware/error.middleware');
const rateLimitMiddleware = require('./middleware/rateLimit.middleware');

const app = express();

// ── Security ──────────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// ── Rate Limiting ─────────────────────────────────────
app.use('/api/', rateLimitMiddleware);

// ── Body Parsing ──────────────────────────────────────
// Webhook route needs raw body for signature verification
app.use('/api/webhook', express.raw({ type: 'application/json' }));

// Everything else gets JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Logging ───────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Routes ────────────────────────────────────────────
// app.use('/api/auth', authRoutes);
// app.use('/api/repos', repoRoutes);
// app.use('/api/reviews', reviewRoutes);
// app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/webhook', webhookRoutes);

// ── Health Check ──────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CodeSense API is running' });
});

// ── 404 Handler ───────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ──────────────────────────────
app.use(errorMiddleware);

module.exports = app;