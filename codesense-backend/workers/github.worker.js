const { Worker } = require("bullmq");
const Issue      = require("../models/Issue");
const Review     = require("../models/Review");
const { postInlineComment, postSummaryComment } = require("../services/github.service");

const initGithubWorker = (redisConnection) => {
  const worker = new Worker("github", async (job) => {
    const {
      reviewId,
      repoFullName,
      prNumber,
      githubToken,
      overallScore,
      grade,
      summary,
      criticalCount,
      totalIssues,
    } = job.data;

    console.log(`\n💬 Posting GitHub comments → PR #${prNumber} | ${repoFullName}`);

    // ── Step 1: Fetch all issues for this review ──────────
    const issues = await Issue.find({
      reviewId,
      isPostedToGitHub: false,
    }).sort({ severity: 1 });

    if (issues.length === 0) {
      console.log("  ℹ️  No issues to post");
      return;
    }

    // ── Step 2: Post inline comments on each issue ────────
    let postedCount = 0;

    for (const issue of issues) {
      try {
        await postInlineComment({
          githubToken,
          repoFullName,
          prNumber,
          filename  : issue.filename,
          line      : issue.line,
          severity  : issue.severity,
          message   : issue.message,
          suggestion: issue.suggestion,
        });

        // Mark as posted
        await Issue.findByIdAndUpdate(issue._id, { isPostedToGitHub: true });
        postedCount++;

        // Small delay to avoid GitHub API rate limits
        await _sleep(300);

      } catch (commentErr) {
        console.error(`  ❌ Failed to post comment for ${issue.filename}:${issue.line} →`, commentErr.message);
      }
    }

    // ── Step 3: Post summary comment ──────────────────────
    try {
      await postSummaryComment({
        githubToken,
        repoFullName,
        prNumber,
        overallScore,
        grade,
        summary,
        criticalCount,
        totalIssues,
      });
    } catch (summaryErr) {
      console.error("  ❌ Failed to post summary comment:", summaryErr.message);
    }

    // ── Step 4: Mark review as posted ────────────────────
    await Review.findByIdAndUpdate(reviewId, { isPostedToGitHub: true });

    // ── Step 5: Emit socket event ──────────────────────────
    global.io?.emit("review:posted", {
      reviewId,
      prNumber,
      repoFullName,
      postedCount,
    });

    console.log(`✅ GitHub comments posted → ${postedCount}/${issues.length} comments`);
    return { reviewId, postedCount };

  }, {
    connection : redisConnection,
    concurrency: 1,   // post one PR at a time to avoid rate limits
  });

  // ── Worker event handlers ─────────────────────────────
  worker.on("completed", (job) => {
    console.log(`✅ GitHub worker: job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`❌ GitHub worker: job ${job.id} failed:`, err.message);
  });

  worker.on("error", (err) => {
    console.error("❌ GitHub worker error:", err.message);
  });

  console.log("✅ GitHub worker initialized");
  return worker;
};

const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = { initGithubWorker };