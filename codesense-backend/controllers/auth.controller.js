const User              = require("../models/User");
const { generateToken } = require("../utils/jwt.utils");
const { success, error }= require("../utils/response.utils");

/* ── Register ─────────────────────────────────────────────
   POST /api/auth/register
   body: { name, email, password }
──────────────────────────────────────────────────────────── */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return error(res, 400, "Please provide name, email and password");

    const exists = await User.findOne({ email });
    if (exists)
      return error(res, 400, "Email already registered");

    const user  = await User.create({ name, email, password });
    const token = generateToken(user._id);

    return success(res, 201, "Registered successfully", {
      token,
      user: { _id: user._id, name: user.name, email: user.email, plan: user.plan, avatar: user.avatar },
    });
  } catch (err) { next(err); }
};

/* ── Login ────────────────────────────────────────────────
   POST /api/auth/login
   body: { email, password }
──────────────────────────────────────────────────────────── */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return error(res, 400, "Please provide email and password");

    const user = await User.findOne({ email }).select("+password");
    if (!user || !user.password)
      return error(res, 401, "Invalid email or password");

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return error(res, 401, "Invalid email or password");

    const token = generateToken(user._id);

    return success(res, 200, "Login successful", {
      token,
      user: { _id: user._id, name: user.name, email: user.email, plan: user.plan, avatar: user.avatar },
    });
  } catch (err) { next(err); }
};

/* ── Get Me ───────────────────────────────────────────────
   GET /api/auth/me
──────────────────────────────────────────────────────────── */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return error(res, 404, "User not found");

    return success(res, 200, "User fetched", {
      user: {
        _id          : user._id,
        name         : user.name,
        email        : user.email,
        plan         : user.plan,
        avatar       : user.avatar,
        githubUsername: user.githubUsername,
        totalReviews : user.totalReviews,
      },
    });
  } catch (err) { next(err); }
};

/* ── Logout ───────────────────────────────────────────────
   POST /api/auth/logout
──────────────────────────────────────────────────────────── */
const logout = async (req, res, next) => {
  try {
    // TODO: blacklist token in Redis
    return success(res, 200, "Logged out successfully");
  } catch (err) { next(err); }
};

/* ── GitHub OAuth Callback ────────────────────────────────
   GET /api/auth/github/callback
──────────────────────────────────────────────────────────── */
const githubCallback = async (req, res) => {
  try {
    const token = generateToken(req.user._id);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  } catch (err) {
    res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }
};

module.exports = { register, login, getMe, logout, githubCallback };