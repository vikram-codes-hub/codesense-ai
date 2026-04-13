const passport       = require('passport')
const GitHubStrategy = require('passport-github2').Strategy
const User           = require('../models/User')
const logger         = require('../utils/logger')

// ── Strategy 1: Login/Signup ───────────────────────
passport.use('github', new GitHubStrategy({
  clientID:     process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL:  process.env.GITHUB_CALLBACK_URL,
  scope:        ['user:email'],
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value || `${profile.username}@github.com`

    let user = await User.findOne({ githubId: profile.id })
    if (!user) {
      user = await User.findOne({ email })
      if (user) {
        user.githubId    = profile.id
        user.githubToken = accessToken
        user.avatar      = user.avatar || profile.photos?.[0]?.value
        await user.save()
      } else {
        user = await User.create({
          name:        profile.displayName || profile.username,
          email,
          githubId:    profile.id,
          githubToken: accessToken,
          avatar:      profile.photos?.[0]?.value,
        })
      }
    } else {
      user.githubToken = accessToken
      await user.save()
    }

    logger.info(`GitHub OAuth login: ${user.email}`)
    return done(null, user)
  } catch (err) {
    logger.error(`GitHub strategy error: ${err.message}`)
    return done(err, null)
  }
}))

// ── Strategy 2: Connect to existing account ────────
passport.use('github-connect', new GitHubStrategy({
  clientID:     process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL:  `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/github/connect/callback`,
  scope:        ['user:email'],
  passReqToCallback: true,
},
async (req, accessToken, refreshToken, profile, done) => {
  try {
    // Get logged-in user from state param (JWT token)
    const { generateToken } = require('../utils/jwt.utils')
    const jwt = require('jsonwebtoken')

    const token = req.query.state
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (!user) return done(new Error('User not found'), null)

    // Check if GitHub already linked to another account
    const existing = await User.findOne({ githubId: profile.id })
    if (existing && existing._id.toString() !== user._id.toString()) {
      return done(new Error('GitHub account already linked to another user'), null)
    }

    // Link GitHub to current user
    user.githubId    = profile.id
    user.githubToken = accessToken
    user.avatar      = user.avatar || profile.photos?.[0]?.value
    await user.save()

    logger.info(`GitHub connected: ${user.email}`)
    return done(null, user)
  } catch (err) {
    logger.error(`GitHub connect error: ${err.message}`)
    return done(err, null)
  }
}))

passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (err) { done(err, null) }
})

module.exports = passport