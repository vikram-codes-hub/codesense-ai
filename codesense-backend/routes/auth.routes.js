const express  = require("express")
const passport = require("passport")
const {
  register, login, getMe, logout,
  githubCallback, githubConnectCallback,
  updateProfile, updatePassword
} = require("../controllers/auth.controller")
const { protect } = require("../middleware/auth.middleware")

const router = express.Router()

router.post("/register",         register)
router.post("/login",            login)
router.post("/logout", protect,  logout)
router.get ("/me",     protect,  getMe)
router.put ("/profile",  protect, updateProfile)
router.put ("/password", protect, updatePassword)

// ── GitHub OAuth Login/Signup ──────────────────────
router.get("/github",
  passport.authenticate("github", { scope: ["user:email", "repo"] })
)
router.get("/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: "/login" }),
  githubCallback
)

// ── GitHub Connect (for logged-in email users) ─────
router.get("/github/connect", (req, res, next) => {
  // Get token from query parameter or Authorization header
  let token = req.query.token || req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' })
  }
  
  passport.authenticate("github-connect", {
    session: false,
    state: token,
    scope: ["user:email", "repo"],
  })(req, res, next)
})
router.get("/github/connect/callback",
  passport.authenticate("github-connect", { session: false, failureRedirect: `${process.env.CLIENT_URL}/settings?error=github_failed` }),
  githubConnectCallback
)

module.exports = router