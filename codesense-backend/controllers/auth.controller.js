const User              = require('../models/User')
const { generateToken } = require('../utils/jwt.utils')
const { success, error }= require('../utils/response.utils')
const redis             = require('../config/redis')
const logger            = require('../utils/logger')

// ── Register ───────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password)
      return error(res, 400, 'Please provide name, email and password')

    const exists = await User.findOne({ email })
    if (exists)
      return error(res, 400, 'Email already registered')

    const user  = await User.create({ name, email, password })
    const token = generateToken(user._id)

    logger.info(`New user registered: ${email}`)

    return success(res, 201, 'Registered successfully', {
      token,
      user: {
        _id:          user._id,
        name:         user.name,
        email:        user.email,
        plan:         user.plan,
        avatar:       user.avatar,
        totalReviews: user.totalReviews,
      },
    })
  } catch (err) { next(err) }
}

// ── Login ──────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password)
      return error(res, 400, 'Please provide email and password')

    const user = await User.findOne({ email }).select('+password')
    if (!user || !user.password)
      return error(res, 401, 'Invalid email or password')

    const isMatch = await user.comparePassword(password)
    if (!isMatch)
      return error(res, 401, 'Invalid email or password')

    const token = generateToken(user._id)

    logger.info(`User logged in: ${email}`)

    return success(res, 200, 'Login successful', {
      token,
      user: {
        _id:          user._id,
        name:         user.name,
        email:        user.email,
        plan:         user.plan,
        avatar:       user.avatar,
        totalReviews: user.totalReviews,
        githubId:     user.githubId,
      },
    })
  } catch (err) { next(err) }
}

// ── Get Me ─────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return error(res, 404, 'User not found')

    return success(res, 200, 'User fetched', {
      _id:          user._id,
      name:         user.name,
      email:        user.email,
      plan:         user.plan,
      avatar:       user.avatar,
      githubId:     user.githubId,
      totalReviews: user.totalReviews,
      createdAt:    user.createdAt,
    })
  } catch (err) { next(err) }
}

// ── Logout ─────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    await redis.set(
      `user:session:${req.token}`,
      'blacklisted',
      'EX',
      7 * 24 * 60 * 60
    )
    logger.info(`User logged out: ${req.user.email}`)
    return success(res, 200, 'Logged out successfully')
  } catch (err) { next(err) }
}

// ── GitHub OAuth Callback ──────────────────────────
const githubCallback = async (req, res) => {
  try {
    const token = generateToken(req.user._id)
    logger.info(`GitHub OAuth login: ${req.user.email}`)
    res.redirect(`${process.env.CLIENT_URL}/auth?token=${token}`)
  } catch (err) {
    logger.error(`GitHub callback error: ${err.message}`)
    res.redirect(`${process.env.CLIENT_URL}/auth?error=oauth_failed`)
  }
}

module.exports = { register, login, getMe, logout, githubCallback }