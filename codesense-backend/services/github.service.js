const crypto     = require('crypto')
const Repository = require('../models/Repository')
const Review     = require('../models/Review')
const User       = require('../models/User')
const { addReviewJob }    = require('../queues/review.queue')
const { emitReviewQueued } = require('../socket')
const logger     = require('../utils/logger')

// ── Verify GitHub Webhook Signature ───────────────────────
const verifySignature = (body, signature) => {
  if (!signature) return false
  try {
    const hmac      = crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET)
    const digest    = 'sha256=' + hmac.update(body).digest('hex')
    const sigBuffer = Buffer.from(signature)
    const digBuffer = Buffer.from(digest)
    if (sigBuffer.length !== digBuffer.length) return false
    return crypto.timingSafeEqual(sigBuffer, digBuffer)
  } catch (err) {
    logger.error(`Signature verification error: ${err.message}`)
    return false
  }
}

// ── Process PR Event ───────────────────────────────────────
const processPREvent = async (payload) => {
  try {
    // Lazy require to avoid circular dependency
    const { fetchPRFiles, fetchFileContent } = require('./github.service')

    const { pull_request, repository, action } = payload

    const githubRepoId = repository.id.toString()
    const prNumber     = pull_request.number
    const prTitle      = pull_request.title
    const prUrl        = pull_request.html_url
    const commitSha    = pull_request.head.sha
    const branch       = pull_request.head.ref

    logger.info(`PR event: ${action} #${prNumber} in ${repository.full_name}`)

    // ── Find repo in our DB ──────────────────────
    const repo = await Repository.findOne({ githubRepoId })
    if (!repo) {
      logger.warn(`Repo not found in DB: ${githubRepoId}`)
      return
    }

    // ── Check for duplicate review ───────────────
    const existing = await Review.findOne({
      repoId:    repo._id,
      prNumber,
      commitSha,
      status:    { $in: ['pending', 'running'] },
    })
    if (existing) {
      logger.warn(`Duplicate review skipped: PR #${prNumber}`)
      return
    }

    // ── Create review document ───────────────────
    const review = await Review.create({
      userId:   repo.userId,
      repoId:   repo._id,
      prNumber,
      prTitle,
      prUrl,
      commitSha,
      branch,
      status:   'pending',
      isManual: false,
    })

    // ── Fetch real files from GitHub API ─────────
    const token   = process.env.GITHUB_TOKEN
    const prFiles = await fetchPRFiles(repository.full_name, prNumber, token)

    logger.info(`Fetched ${prFiles.length} files from PR #${prNumber}`)

    const files = await Promise.all(
      prFiles.map(async (f) => {
        const content = await fetchFileContent(f.raw_url, token)
        const ext     = f.filename.split('.').pop().toLowerCase()
        const langMap = {
          js:   'javascript',
          jsx:  'javascript',
          ts:   'typescript',
          tsx:  'typescript',
          py:   'python',
          java: 'java',
          cpp:  'cpp',
          c:    'c',
        }
        return {
          filename: f.filename,
          content:  typeof content === 'string' ? content : JSON.stringify(content),
          language: langMap[ext] || 'javascript',
        }
      })
    )

    logger.info(`Files ready for analysis: ${files.map(f => f.filename).join(', ')}`)

    // ── Add to queue ─────────────────────────────
    await addReviewJob({
      reviewId:     review._id.toString(),
      repoId:       repo._id.toString(),
      userId:       repo.userId.toString(),
      repoFullName: repository.full_name,
      prNumber,
      commitSha,
      githubToken:  token,
      files,
      isManual:     false,
    })

    // ── Emit socket event ─────────────────────────
    emitReviewQueued(review._id.toString(), {
      prTitle,
      repoName: repo.repoName,
    })

    await User.findByIdAndUpdate(repo.userId, { $inc: { totalReviews: 1 } })

    logger.info(`Review queued: ${review._id} for PR #${prNumber}`)

  } catch (err) {
    logger.error(`processPREvent error: ${err.message}`)
    throw err
  }
}

module.exports = { verifySignature, processPREvent }