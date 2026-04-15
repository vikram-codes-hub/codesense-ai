const User              = require('../models/User')
const { generateToken } = require('../utils/jwt.utils')
const { success, error } = require('../utils/response.utils')
const redis             = require('../config/redis')
const logger            = require('../utils/logger')

// ── Register ───────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    const trimmedName = name?.trim()
    const trimmedEmail = email?.trim()

    if (!trimmedName || !trimmedEmail || !password) return error(res, 400, 'Please provide name, email and password')

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
    const isNewUser = !req.user.password 
    
    logger.info(`GitHub OAuth: ${req.user.email}`)
    
    // Redirect to auth page with token (Auth.jsx will handle it and navigate to dashboard)
    res.redirect(`${process.env.CLIENT_URL}/auth?token=${token}&github=connected${isNewUser ? '&new=true' : ''}`)
  } catch (err) {
    logger.error(`GitHub callback error: ${err.message}`)
    res.redirect(`${process.env.CLIENT_URL}/auth?error=github_connection_failed`)
  }
}


const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true }
    )
    return success(res, 200, 'Profile updated', { name: user.name, email: user.email })
  } catch (err) { next(err) }
}

const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user._id).select('+password')
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) return error(res, 401, 'Current password is incorrect')
    user.password = newPassword
    await user.save()
    return success(res, 200, 'Password updated')
  } catch (err) { next(err) }
}
// ── GitHub Connect Callback ────────────────────────
const githubConnectCallback = async (req, res) => {
  try {
    logger.info(`GitHub connected: ${req.user.email}`)
    res.redirect(`${process.env.CLIENT_URL}/settings?github=connected`)
  } catch (err) {
    logger.error(`GitHub connect callback error: ${err.message}`)
    res.redirect(`${process.env.CLIENT_URL}/settings?error=github_failed`)
  }
}

// Add to exports:
module.exports = { register, login, getMe, logout, githubCallback, githubConnectCallback, updateProfile, updatePassword }
