const Review            = require("../models/Review");
const ReviewFile        = require("../models/ReviewFile");
const Issue             = require("../models/Issue");
const Repository        = require("../models/Repository");
const { success, error }= require("../utils/response.utils");
const { addReviewJob }  = require("../queues/review.queue");

/* ── Get All Reviews ──────────────────────────────────────
   GET /api/reviews
──────────────────────────────────────────────────────────── */
const getReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query
    const query = { userId: req.user._id }
    if (status) query.status = status

    const skip    = (parseInt(page) - 1) * parseInt(limit)
    const total   = await Review.countDocuments(query)
    const reviews = await Review.find(query)
      .populate("repoId", "repoName repoFullName language")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    return success(res, 200, "Reviews fetched", {
      reviews, total,
      page : parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    })
  } catch (err) { next(err) }
}

/* ── Get Single Review ────────────────────────────────────
   GET /api/reviews/:id
──────────────────────────────────────────────────────────── */
const getReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, userId: req.user._id })
      .populate("repoId", "repoName repoFullName language")
    if (!review) return error(res, 404, "Review not found")

    const issues = await Issue.find({ reviewId: review._id }).sort({ severity: 1 })
    return success(res, 200, "Review fetched", { review, issues })
  } catch (err) { next(err) }
}

/* ── Get Review Files ─────────────────────────────────────
   GET /api/reviews/:id/files
──────────────────────────────────────────────────────────── */
const getReviewFiles = async (req, res, next) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, userId: req.user._id })
    if (!review) return error(res, 404, "Review not found")

    const files = await ReviewFile.find({ reviewId: review._id })
    const filesWithIssues = await Promise.all(
      files.map(async (file) => {
        const issues = await Issue.find({ fileId: file._id }).sort({ line: 1 })
        return { ...file.toObject(), issues }
      })
    )
    return success(res, 200, "Files fetched", { files: filesWithIssues })
  } catch (err) { next(err) }
}

/* ── Manual Review ────────────────────────────────────────
   POST /api/reviews/manual
──────────────────────────────────────────────────────────── */
const manualReview = async (req, res, next) => {
  try {
    const { code, language, filename } = req.body
    if (!code || !language) return error(res, 400, "Please provide code and language")

    let repo = await Repository.findOne({ userId: req.user._id, repoName: "manual-reviews" })
    if (!repo) {
      repo = await Repository.create({
        userId      : req.user._id,
        repoName    : "manual-reviews",
        repoFullName: `${req.user.name}/manual-reviews`,
        githubRepoId: 0,
        isConnected : false,
      })
    }

    const review = await Review.create({
      userId  : req.user._id,
      repoId  : repo._id,
      prTitle : filename || "Manual Review",
      status  : "pending",
      isManual: true,
    })

    await addReviewJob({
      reviewId: review._id.toString(),
      isManual: true,
      files   : [{ filename: filename || "code.js", content: code, language }],
    })

    global.io?.to(req.user._id.toString()).emit("review:queued", {
      reviewId: review._id,
      prTitle : filename || "Manual Review",
    })

    return success(res, 201, "Review queued successfully", {
      reviewId: review._id,
      status  : "pending",
    })
  } catch (err) { next(err) }
}

/* ── Delete Review ────────────────────────────────────────
   DELETE /api/reviews/:id
──────────────────────────────────────────────────────────── */
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, userId: req.user._id })
    if (!review) return error(res, 404, "Review not found")

    await Issue.deleteMany({ reviewId: review._id })
    await ReviewFile.deleteMany({ reviewId: review._id })
    await Review.deleteOne({ _id: review._id })

    return success(res, 200, "Review deleted successfully")
  } catch (err) { next(err) }
}

/* ── Get AI Fix for Issue ─────────────────────────────────
   POST /api/reviews/:id/issues/:issueId/ai-fix
──────────────────────────────────────────────────────────── */
const getAIFix = async (req, res, next) => {
  try {
    const { getAIFix: generateFix } = require('../services/ai.service')

    const review = await Review.findOne({ _id: req.params.id, userId: req.user._id })
    if (!review) return error(res, 404, "Review not found")

    const issue = await Issue.findOne({ _id: req.params.issueId, reviewId: review._id })
    if (!issue) return error(res, 404, "Issue not found")

    // Return cached AI fix if already generated
    if (issue.aiExplanation) {
      return success(res, 200, "AI fix fetched", {
        explanation:    issue.aiExplanation,
        fixedCode:      issue.aiFixedCode,
        fixDescription: issue.aiFixDescription,
        confidence:     issue.aiConfidence,
        provider:       issue.aiProvider,
        cached:         true,
      })
    }

    // Get file content for context
    const reviewFile = await require('../models/ReviewFile').findById(issue.fileId)
    const fileContent = reviewFile?.content || ''

    // Generate AI fix
    const aiFix = await generateFix(issue, fileContent, issue.filename)

    if (!aiFix) {
      return error(res, 503, "AI service unavailable. Please try again later.")
    }

    // Save to DB
    await Issue.findByIdAndUpdate(issue._id, {
      aiExplanation   : aiFix.explanation,
      aiFixedCode     : aiFix.fixedCode,
      aiFixDescription: aiFix.fixDescription,
      aiConfidence    : aiFix.confidence,
      aiProvider      : aiFix.provider,
      aiGeneratedAt   : new Date(),
    })

    return success(res, 200, "AI fix generated", {
      explanation:    aiFix.explanation,
      fixedCode:      aiFix.fixedCode,
      fixDescription: aiFix.fixDescription,
      confidence:     aiFix.confidence,
      provider:       aiFix.provider,
      cached:         false,
    })
  } catch (err) { next(err) }
}

module.exports = { getReviews, getReview, getReviewFiles, manualReview, deleteReview, getAIFix }