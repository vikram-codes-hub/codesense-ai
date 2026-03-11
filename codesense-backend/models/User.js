const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type    : String,
    required: [true, "Name is required"],
    trim    : true,
  },
  email: {
    type     : String,
    required : [true, "Email is required"],
    unique   : true,
    lowercase: true,
    trim     : true,
  },
  password: {
    type   : String,
    default: null,
    select : false,  // never returned in queries
  },
  githubId: {
    type   : String,
    default: null,
  },
  githubUsername: {
    type   : String,
    default: null,
  },
  githubToken: {
    type   : String,
    default: null,
    select : false,
  },
  avatar: {
    type   : String,
    default: null,
  },
  plan: {
    type   : String,
    enum   : ["free", "pro"],
    default: "free",
  },
  totalReviews: {
    type   : Number,
    default: 0,
  },
}, { timestamps: true });

// ── Hash password before save ─────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Compare password ──────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);