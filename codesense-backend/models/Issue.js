const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      required: true,
    },
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReviewFile',
      required: true,
    },
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['security', 'bug', 'complexity', 'style'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      required: true,
    },
    line: {
      type: Number,
      default: null,
    },
    column: {
      type: Number,
      default: null,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    suggestion: {
      type: String,
      default: null,
    },
    code: {
      type: String,
      default: null,
    },
    isPostedToGitHub: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Issue', issueSchema);