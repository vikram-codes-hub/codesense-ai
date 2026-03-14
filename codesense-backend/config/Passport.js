const passport       = require('passport')
const GitHubStrategy = require('passport-github2').Strategy
const User           = require('../models/User')
const logger         = require('../utils/logger')

passport.use(new GitHubStrategy({
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
        // Link GitHub to existing account
        user.githubId    = profile.id
        user.githubToken = accessToken
        user.avatar      = user.avatar || profile.photos?.[0]?.value
        await user.save()
      } else {
        // Create brand new user
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

    logger.info(`GitHub OAuth: ${user.email}`)
    return done(null, user)

  } catch (err) {
    logger.error(`GitHub strategy error: ${err.message}`)
    return done(err, null)
  }
}))

module.exports = passport