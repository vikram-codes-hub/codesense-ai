const { Worker }    = require('bullmq')
const Issue         = require('../models/Issue')
const Review        = require('../models/Review')
const connection    = require('../config/bullmq')
const logger        = require('../utils/logger')
const {
  postInlineComment,
  postSummaryComment,
  formatSummaryComment,
} = require('../services/github.service')

const initGithubWorker = (redisConnection) => {
  const worker = new Worker('github', async (job) => {
    const {
      reviewId,
      repoFullName,
      prNumber,
      githubToken,
    } = job.data

    logger.info(`Posting GitHub comments → PR #${prNumber} | ${repoFullName}`)

    // ── Step 1: Fetch unposted issues ─────────────────────
    const issues = await Issue.find({
      reviewId,
      isPostedToGitHub: false,
    }).sort({ severity: 1 })

    if (issues.length === 0) {
      logger.info('No issues to post')
    }

    // ── Step 2: Get review for commitSha ──────────────────
    const review = await Review.findById(reviewId)
    if (!review) {
      throw new Error(`Review not found: ${reviewId}`)
    }

    // ── Step 3: Post inline comments ─────────────────────
    let postedCount = 0

    for (const issue of issues) {
      try {
        const body = [
          `**[${issue.severity.toUpperCase()}] ${issue.message}**`,
          '',
          issue.description || '',
          '',
          issue.suggestion ? `💡 **Suggestion:** ${issue.suggestion}` : '',
        ].filter(Boolean).join('\n')

        await postInlineComment(
          repoFullName,
          prNumber,
          review.commitSha,
          issue.filename,
          issue.line || 1,
          body,
          githubToken
        )

        await Issue.findByIdAndUpdate(issue._id, { isPostedToGitHub: true })
        postedCount++

        // Avoid GitHub rate limits
        await _sleep(300)

      } catch (commentErr) {
        logger.error(`Failed to post comment ${issue.filename}:${issue.line} → ${commentErr.message}`)
      }
    }

    // ── Step 4: Post summary comment ──────────────────────
    try {
      const summaryBody = formatSummaryComment(review)
      await postSummaryComment(repoFullName, prNumber, summaryBody, githubToken)
    } catch (summaryErr) {
      logger.error(`Failed to post summary comment: ${summaryErr.message}`)
    }

    // ── Step 5: Mark review as posted ────────────────────
    await Review.findByIdAndUpdate(reviewId, { isPostedToGitHub: true })

    // ── Step 6: Emit socket event ─────────────────────────
    global.io?.emit('review:posted', {
      reviewId,
      prNumber,
      repoFullName,
      postedCount,
    })

    logger.info(`GitHub comments posted → ${postedCount}/${issues.length}`)
    return { reviewId, postedCount }

  }, {
    connection:  redisConnection,
    concurrency: 1,
  })

  worker.on('completed', (job) => {
    logger.info(`GitHub worker: job ${job.id} completed`)
  })

  worker.on('failed', (job, err) => {
    logger.error(`GitHub worker: job ${job.id} failed: ${err.message}`)
  })

  worker.on('error', (err) => {
    logger.error(`GitHub worker error: ${err.message}`)
  })

  logger.info('GitHub worker initialized')
  return worker
}

const _sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// ── Init ──────────────────────────────────────────────────
const githubWorker = initGithubWorker(connection)

module.exports = { githubWorker }