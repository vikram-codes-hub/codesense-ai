const mongoose = require("mongoose");

const reviewFileSchema = new mongoose.Schema({
  reviewId: {
    type    : mongoose.Schema.Types.ObjectId,
    ref     : "Review",
    required: true,
  },
  filename   : { type: String, required: true },
  language   : { type: String, default: "unknown" },
  content    : { type: String, default: "" },
  score      : { type: Number, default: null },
  totalIssues: { type: Number, default: 0 },
}, { timestamps: true });

reviewFileSchema.index({ reviewId: 1 });

module.exports = mongoose.model("ReviewFile", reviewFileSchema);