const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  userId: {
    type    : mongoose.Schema.Types.ObjectId,
    ref     : "User",
    required: true,
  },
  repoId: {
    type    : mongoose.Schema.Types.ObjectId,
    ref     : "Repository",
    required: true,
  },
  prNumber : { type: Number, default: null },
  prTitle  : { type: String, default: "Manual Review" },
  prUrl    : { type: String, default: null },
  commitSha: { type: String, default: null },
  branch   : { type: String, default: null },

  status: {
    type   : String,
    enum   : ["pending", "running", "completed", "failed"],
    default: "pending",
  },

  // ── Scores ─────────────────────────────────────────────
  overallScore   : { type: Number, default: null },
  securityScore  : { type: Number, default: null },
  bugScore       : { type: Number, default: null },
  complexityScore: { type: Number, default: null },
  styleScore     : { type: Number, default: null },
  grade          : { type: String, default: null },
  gradeLabel     : { type: String, default: null },

  // ── Issue counts ───────────────────────────────────────
  totalIssues  : { type: Number, default: 0 },
  criticalCount: { type: Number, default: 0 },
  highCount    : { type: Number, default: 0 },
  mediumCount  : { type: Number, default: 0 },
  lowCount     : { type: Number, default: 0 },

  filesAnalyzed   : { type: Number,  default: 0 },
  summary         : { type: String,  default: null },
  isPostedToGitHub: { type: Boolean, default: false },
  isManual        : { type: Boolean, default: false },
  executionTime   : { type: Number,  default: null },
  completedAt     : { type: Date,    default: null },
  error           : { type: String,  default: null },

}, { timestamps: true });

// ── Indexes ───────────────────────────────────────────────
reviewSchema.index({ userId: 1, createdAt: -1 });
reviewSchema.index({ repoId: 1, createdAt: -1 });
reviewSchema.index({ status: 1 });

module.exports = mongoose.model("Review", reviewSchema);