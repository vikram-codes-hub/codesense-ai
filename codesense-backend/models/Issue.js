const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
  reviewId: {
    type    : mongoose.Schema.Types.ObjectId,
    ref     : "Review",
    required: true,
  },
  fileId: {
    type    : mongoose.Schema.Types.ObjectId,
    ref     : "ReviewFile",
    required: true,
  },
  filename   : { type: String, required: true },
  type       : { type: String, enum: ["security", "bug", "complexity", "style"] },
  severity   : { type: String, enum: ["critical", "high", "medium", "low"] },
  line       : { type: Number, default: 1 },
  column     : { type: Number, default: 1 },
  message    : { type: String, required: true },
  description: { type: String, default: "" },
  suggestion : { type: String, default: "" },
  code       : { type: String, default: "" },
  isPostedToGitHub: { type: Boolean, default: false },

  //AI Fix fields
  aiExplanation : { type: String, default: null },
  aiFixedCode   : { type: String, default: null },
  aiFixDescription: { type: String, default: null },
  aiConfidence  : { type: Number, default: null },
  aiProvider    : { type: String, default: null },
  aiGeneratedAt : { type: Date,   default: null },

}, { timestamps: true });

issueSchema.index({ reviewId: 1 })
issueSchema.index({ reviewId: 1, type: 1 })
issueSchema.index({ reviewId: 1, severity: 1 })

module.exports = mongoose.model("Issue", issueSchema)