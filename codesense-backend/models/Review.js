const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    repoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
    },
    prNumber: {
      type: Number,
      default: null,
    },
    prTitle: {
      type: String,
      default: 'Manual Review',
      trim: true,
    },
    prUrl: {
      type: String,
      default: null,
    },
    commitSha: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    isManual: {
      type: Boolean,
      default: false,
    },

    // ── Scores ─────────────────────────────────────────
    overallScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    securityScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    bugScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    complexityScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    styleScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },

    // ── Issue counts ───────────────────────────────────
    totalIssues: {
      type: Number,
      default: 0,
    },
    criticalCount: {
      type: Number,
      default: 0,
    },
    highCount: {
      type: Number,
      default: 0,
    },
    mediumCount: {
      type: Number,
      default: 0,
    },
    lowCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);