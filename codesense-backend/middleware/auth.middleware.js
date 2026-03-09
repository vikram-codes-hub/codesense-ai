const { verifyToken } = require('../utils/jwt.utils');
const redis = require('../config/redis');
const User = require('../models/User');
const logger = require('../utils/logger');

const protect = async (req, res, next) => {
  try {
    let token;

    // ── Extract token ──────────────────────────────
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    // ── Check blacklist (logout) ───────────────────
    const isBlacklisted = await redis.get(`user:session:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ success: false, message: 'Token invalidated, please login again' });
    }

    // ── Verify token ───────────────────────────────
    const decoded = verifyToken(token);

    // ── Attach user to request ─────────────────────
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }

    req.user = user;
    req.token = token;
    next();

  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

module.exports = { protect };