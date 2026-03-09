const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    repoName: {
      type: String,
      required: true,
      trim: true,
    },
    repoFullName: {
      type: String,
      required: true,
      trim: true,
    },
    githubRepoId: {
      type: String,
      required: true,
      unique: true,
    },
    webhookId: {
      type: String,
      default: null,
    },
    isConnected: {
      type: Boolean,
      default: true,
    },
    avgScore: {
      type: Number,
      default: null,
    },
    language: {
      type: String,
      default: null,
    },
    lastReviewAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Repository', repositorySchema);