const Repository        = require("../models/Repository");
const Review            = require("../models/Review");
const { success, error }= require("../utils/response.utils");

/* ── Get All Connected Repos ──────────────────────────────
   GET /api/repos
──────────────────────────────────────────────────────────── */
const getRepos = async (req, res, next) => {
  try {
    const repos = await Repository.find({ userId: req.user._id, isConnected: true })
      .sort({ createdAt: -1 });

    return success(res, 200, "Repos fetched", { repos });
  } catch (err) { next(err); }
};

/* ── Get GitHub Repos to choose from ─────────────────────
   GET /api/repos/github
──────────────────────────────────────────────────────────── */
const getGithubRepos = async (req, res, next) => {
  try {
    // TODO: call github.service.js → getUserRepos(req.user.githubToken)
    return success(res, 200, "GitHub repos fetched", { repos: [] });
  } catch (err) { next(err); }
};

/* ── Connect Repo ─────────────────────────────────────────
   POST /api/repos/connect
   body: { repoFullName, repoName, githubRepoId, defaultBranch, language }
──────────────────────────────────────────────────────────── */
const connectRepo = async (req, res, next) => {
  try {
    const { repoFullName, repoName, githubRepoId, defaultBranch, language } = req.body;

    if (!repoFullName || !repoName || !githubRepoId)
      return error(res, 400, "Please provide repoFullName, repoName and githubRepoId");

    const exists = await Repository.findOne({ userId: req.user._id, githubRepoId });
    if (exists)
      return error(res, 400, "Repository already connected");

    // TODO: await addWebhook(req.user.githubToken, repoFullName)

    const repo = await Repository.create({
      userId       : req.user._id,
      repoName,
      repoFullName,
      githubRepoId,
      defaultBranch: defaultBranch || "main",
      language     : language      || "Unknown",
      webhookId    : null,
    });

    return success(res, 201, "Repository connected successfully", { repo });
  } catch (err) { next(err); }
};

/* ── Disconnect Repo ──────────────────────────────────────
   DELETE /api/repos/:id
──────────────────────────────────────────────────────────── */
const disconnectRepo = async (req, res, next) => {
  try {
    const repo = await Repository.findOne({ _id: req.params.id, userId: req.user._id });
    if (!repo) return error(res, 404, "Repository not found");

    // TODO: await removeWebhook(req.user.githubToken, repo.repoFullName, repo.webhookId)

    await Repository.deleteOne({ _id: repo._id });

    return success(res, 200, "Repository disconnected successfully");
  } catch (err) { next(err); }
};

/* ── Get Repo Reviews ─────────────────────────────────────
   GET /api/repos/:id/reviews
──────────────────────────────────────────────────────────── */
const getRepoReviews = async (req, res, next) => {
  try {
    const repo = await Repository.findOne({ _id: req.params.id, userId: req.user._id });
    if (!repo) return error(res, 404, "Repository not found");

    const reviews = await Review.find({ repoId: repo._id })
      .sort({ createdAt: -1 })
      .limit(20);

    return success(res, 200, "Reviews fetched", { reviews });
  } catch (err) { next(err); }
};

module.exports = { getRepos, getGithubRepos, connectRepo, disconnectRepo, getRepoReviews };