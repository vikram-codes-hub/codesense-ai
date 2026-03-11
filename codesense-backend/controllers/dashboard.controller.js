const Review            = require("../models/Review");
const Repository        = require("../models/Repository");
const Issue             = require("../models/Issue");
const { success, error }= require("../utils/response.utils");

/* ── Get Dashboard Stats ──────────────────────────────────
   GET /api/dashboard/stats
──────────────────────────────────────────────────────────── */
const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [totalReviews, completedReviews, totalRepos, scoreData] = await Promise.all([
      Review.countDocuments({ userId }),
      Review.countDocuments({ userId, status: "completed" }),
      Repository.countDocuments({ userId, isConnected: true }),
      Review.aggregate([
        { $match: { userId, status: "completed", overallScore: { $ne: null } } },
        {
          $group: {
            _id           : null,
            avgScore      : { $avg: "$overallScore" },
            criticalIssues: { $sum: "$criticalCount" },
            totalIssues   : { $sum: "$totalIssues" },
          },
        },
      ]),
    ]);

    const avgScore       = scoreData[0]?.avgScore       ? Math.round(scoreData[0].avgScore) : null;
    const criticalIssues = scoreData[0]?.criticalIssues || 0;
    const totalIssues    = scoreData[0]?.totalIssues    || 0;

    return success(res, 200, "Stats fetched", {
      stats: { totalReviews, completedReviews, totalRepos, totalIssues, avgScore, criticalIssues },
    });
  } catch (err) { next(err); }
};

/* ── Get Recent Reviews ───────────────────────────────────
   GET /api/dashboard/recent
──────────────────────────────────────────────────────────── */
const getRecent = async (req, res, next) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .populate("repoId", "repoName repoFullName")
      .sort({ createdAt: -1 })
      .limit(5);

    return success(res, 200, "Recent reviews fetched", { reviews });
  } catch (err) { next(err); }
};

module.exports = { getStats, getRecent };