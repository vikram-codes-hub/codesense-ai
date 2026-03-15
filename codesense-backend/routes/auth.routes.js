const express  = require("express");
const passport = require("passport");
const { register, login, getMe, logout, githubCallback,updateProfile,updatePassword } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register",         register);
router.post("/login",            login);
router.post("/logout", protect,  logout);
router.get ("/me",     protect,  getMe);
router.put("/profile",  protect,  updateProfile);
router.put("/password", protect,  updatePassword);

// GitHub OAuth
router.get("/github",          passport.authenticate("github", { scope: ["user:email", "repo"] }));
router.get("/github/callback", passport.authenticate("github", { session: false, failureRedirect: "/login" }), githubCallback);

module.exports = router;