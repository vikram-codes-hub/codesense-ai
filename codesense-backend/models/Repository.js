const mongoose = require("mongoose");

const repositorySchema = new mongoose.Schema({
  userId: {
    type    : mongoose.Schema.Types.ObjectId,
    ref     : "User",
    required: true,
  },
  repoName: {
    type    : String,
    required: true,
    trim    : true,
  },
  repoFullName: {
    type    : String,
    required: true,
    trim    : true,
    // e.g. "vikram-codes-hub/codesense-ai"
  },
  githubRepoId: {
    type    : Number,
    required: true,
  },
  defaultBranch: {
    type   : String,
    default: "main",
  },
  language: {
    type   : String,
    default: "Unknown",
  },
  isConnected: {
    type   : Boolean,
    default: true,
  },
  webhookId: {
    type   : Number,
    default: null,
  },
  lastReviewAt: {
    type   : Date,
    default: null,
  },
  totalReviews: {
    type   : Number,
    default: 0,
  },
  avgScore: {
    type   : Number,
    default: null,
  },
}, { timestamps: true });
repositorySchema.index({ userId: 1, githubRepoId: 1 }, { unique: true })

module.exports = mongoose.model("Repository", repositorySchema);