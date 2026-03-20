const { Worker } = require('bullmq')
const axios      = require('axios')
const Issue      = require('../models/Issue')
const Review     = require('../models/Review')
const connection = require('../config/bullmq')
const logger     = require('../utils/logger')

const postComment = async (repoFullName, prNumber, commitSha, filename, line, body, token) => {
  await axios.post(
    `https://api.github.com/repos/${repoFullName}/pulls/${prNumber}/comments`,
    { body, commit_id: commitSha, path: filename, line, side: 'RIGHT' },
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json', 'X-GitHub-Api-Version': '2022-11-28' } }
  )
}

const postSummary = async (repoFullName, prNumber, body, token) => {
  await axios.post(
    `https://api.github.com/repos/${repoFullName}/issues/${prNumber}/comments`,
    { body },
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json', 'X-GitHub-Api-Version': '2022-11-28' } }
  )
}

const buildSummary = (review) => {
  const score = review.overallScore
  const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F'
  const emoji = { A: '🟢', B: '🟡', C: '🟠', D: '🔴', F: '⛔' }[grade]
  return `## ${emoji} CodeSense AI Review

**Overall Score: ${score}/100 (${grade})**

| Category | Score |
|----------|-------|
| 🔒 Security | ${review.securityScore}/100 |
| 🐛 Bugs | ${review.bugScore}/100 |
| ⚡ Complexity | ${review.complexityScore}/100 |
| 🎨 Style | ${review.styleScore}/100 |

**Issues Found:**
- 🔴 Critical: ${review.criticalCount}
- 🟠 High: ${review.highCount}
- 🟡 Medium: ${review.mediumCount}
- 🔵 Low: ${review.lowCount}

> *Powered by CodeSense AI*`
}

const initGithubWorker = (redisConnection) => {
  const worker = new Worker('github', async (job) => {
    const { reviewId, repoFullName, prNumber, githubToken } = job.data

    logger.info(`Posting GitHub comments → PR #${prNumber} | ${repoFullName}`)

    const issues = await Issue.find({ reviewId, isPostedToGitHub: false }).sort({ severity: 1 })
    const review = await Review.findById(reviewId)
    if (!review) throw new Error(`Review not found: ${reviewId}`)

    let postedCount = 0

    for (const issue of issues) {
      try {
        const body = [
          `**[${issue.severity.toUpperCase()}] ${issue.message}**`,
          '',
          issue.description || '',
          issue.suggestion ? `\n💡 **Suggestion:** ${issue.suggestion}` : '',
        ].filter(Boolean).join('\n')

        await postComment(repoFullName, prNumber, review.commitSha, issue.filename, issue.line || 1, body, githubToken)
        await Issue.findByIdAndUpdate(issue._id, { isPostedToGitHub: true })
        postedCount++
        await new Promise(r => setTimeout(r, 300))
      } catch (err) {
        logger.error(`Failed to post comment: ${err.message}`)
      }
    }

    try {
      await postSummary(repoFullName, prNumber, buildSummary(review), githubToken)
    } catch (err) {
      logger.error(`Failed to post summary: ${err.message}`)
    }

    await Review.findByIdAndUpdate(reviewId, { isPostedToGitHub: true })
    global.io?.emit('review:posted', { reviewId, prNumber, repoFullName, postedCount })
    logger.info(`GitHub comments posted → ${postedCount}/${issues.length}`)
    return { reviewId, postedCount }

  }, { connection: redisConnection, concurrency: 1 })

  worker.on('completed', (job) => logger.info(`GitHub worker: job ${job.id} completed`))
  worker.on('failed',    (job, err) => logger.error(`GitHub worker: job ${job.id} failed: ${err.message}`))
  worker.on('error',     (err) => logger.error(`GitHub worker error: ${err.message}`))

  logger.info('GitHub worker initialized')
  return worker
}

const githubWorker = initGithubWorker(connection)
module.exports = { githubWorker }