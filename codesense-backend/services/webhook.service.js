const axios      = require('axios')
const crypto     = require('crypto')
const Repository = require('../models/Repository')
const Review     = require('../models/Review')
const User       = require('../models/User')
const { addReviewJob }     = require('../queues/review.queue')
const { emitReviewQueued } = require('../socket')
const logger     = require('../utils/logger')

const SUPPORTED = ['.js','.jsx','.ts','.tsx','.py','.java','.cpp','.c']
const LANG_MAP  = { js:'javascript',jsx:'javascript',ts:'typescript',tsx:'typescript',py:'python',java:'java',cpp:'cpp',c:'c' }

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

const processPREvent = async (payload) => {
  try {
    const { pull_request, repository, action } = payload
    const githubRepoId = repository.id.toString()
    const prNumber     = pull_request.number
    const prTitle      = pull_request.title
    const prUrl        = pull_request.html_url
    const commitSha    = pull_request.head.sha
    const branch       = pull_request.head.ref
    const token        = process.env.GITHUB_TOKEN

    logger.info(`PR event: ${action} #${prNumber} in ${repository.full_name}`)

    const repo = await Repository.findOne({ githubRepoId })
    if (!repo) { logger.warn(`Repo not found: ${githubRepoId}`); return }

    const existing = await Review.findOne({
      repoId: repo._id, prNumber, commitSha,
      status: { $in: ['pending', 'running'] },
    })
    if (existing) { logger.warn(`Duplicate skipped: PR #${prNumber}`); return }

    const review = await Review.create({
      userId: repo.userId, repoId: repo._id,
      prNumber, prTitle, prUrl, commitSha, branch,
      status: 'pending', isManual: false,
    })

    // ── Fetch PR files directly via axios ────────
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
    }

    const { data: prFiles } = await axios.get(
      `https://api.github.com/repos/${repository.full_name}/pulls/${prNumber}/files`,
      { headers }
    )

    const supported = prFiles.filter(f =>
      f.status !== 'removed' &&
      SUPPORTED.some(ext => f.filename.endsWith(ext))
    )

    logger.info(`Fetched ${supported.length} files from PR #${prNumber}`)

    const files = await Promise.all(
      supported.map(async (f) => {
        try {
          const { data: content } = await axios.get(f.raw_url, { headers })
          const ext = f.filename.split('.').pop().toLowerCase()
          return {
            filename: f.filename,
            content:  typeof content === 'string' ? content : JSON.stringify(content),
            language: LANG_MAP[ext] || 'javascript',
          }
        } catch (e) {
          logger.error(`Failed to fetch ${f.filename}: ${e.message}`)
          return null
        }
      })
    )

    const validFiles = files.filter(Boolean)
    logger.info(`Files ready: ${validFiles.map(f => f.filename).join(', ')}`)

    await addReviewJob({
      reviewId:     review._id.toString(),
      repoId:       repo._id.toString(),
      userId:       repo.userId.toString(),
      repoFullName: repository.full_name,
      prNumber, commitSha,
      githubToken:  token,
      files:        validFiles,
      isManual:     false,
    })

    emitReviewQueued(review._id.toString(), { prTitle, repoName: repo.repoName })

    await User.findByIdAndUpdate(repo.userId, { $inc: { totalReviews: 1 } })

    logger.info(`Review queued: ${review._id} for PR #${prNumber}`)

  } catch (err) {
    logger.error(`processPREvent error: ${err.message}`)
    throw err
  }
}

module.exports = { verifySignature, processPREvent }