const mongoose = require('mongoose');

const reviewFileSchema = new mongoose.Schema(
  {
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      required: true,
    },
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    language: {
      type: String,
      default: 'unknown',
    },
    content: {
      type: String,
      default: null,
    },
    score: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    totalIssues: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReviewFile', reviewFileSchema);