const axios  = require('axios')
const logger = require('../utils/logger')

const GITHUB_API = 'https://api.github.com'
const TOKEN      = process.env.GITHUB_TOKEN

const githubClient = (token = TOKEN) => axios.create({
  baseURL: GITHUB_API,
  headers: {
    Authorization: `Bearer ${token}`,
    Accept:        'application/vnd.github.v3+json',
    'X-GitHub-Api-Version': '2022-11-28',
  },
})

// ── Fetch PR Files ─────────────────────────────────────────
const fetchPRFiles = async (repoFullName, prNumber, token) => {
  try {
    const client   = githubClient(token)
    const response = await client.get(
      `/repos/${repoFullName}/pulls/${prNumber}/files`
    )

    return response.data
      .filter(f => f.status !== 'removed')
      .filter(f => isSupportedFile(f.filename))
      .map(f => ({
        filename:  f.filename,
        patch:     f.patch || '',
        additions: f.additions,
        deletions: f.deletions,
        raw_url:   f.raw_url,
      }))

  } catch (err) {
    logger.error(`fetchPRFiles error: ${err.message}`)
    throw err
  }
}

// ── Fetch File Content ─────────────────────────────────────
const fetchFileContent = async (rawUrl, token) => {
  try {
    const response = await axios.get(rawUrl, {
      headers: { Authorization: `Bearer ${token || TOKEN}` },
    })
    return response.data
  } catch (err) {
    logger.error(`fetchFileContent error: ${err.message}`)
    return ''
  }
}

// ── Post Inline Comment ────────────────────────────────────
const postInlineComment = async (repoFullName, prNumber, commitSha, filename, line, body, token) => {
  try {
    const client = githubClient(token)
    await client.post(
      `/repos/${repoFullName}/pulls/${prNumber}/comments`,
      {
        body,
        commit_id: commitSha,
        path:      filename,
        line,
        side:      'RIGHT',
      }
    )
    logger.info(`Comment posted: ${filename}:${line}`)
  } catch (err) {
    logger.error(`postInlineComment error: ${err.message}`)
  }
}

// ── Post Summary Comment ───────────────────────────────────
const postSummaryComment = async (repoFullName, prNumber, body, token) => {
  try {
    const client = githubClient(token)
    await client.post(
      `/repos/${repoFullName}/issues/${prNumber}/comments`,
      { body }
    )
    logger.info(`Summary comment posted on PR #${prNumber}`)
  } catch (err) {
    logger.error(`postSummaryComment error: ${err.message}`)
  }
}

// ── Add Webhook ────────────────────────────────────────────
const addWebhook = async (repoFullName, token) => {
  try {
    const client   = githubClient(token)
    const response = await client.post(
      `/repos/${repoFullName}/hooks`,
      {
        name:   'web',
        active: true,
        events: ['pull_request'],
        config: {
          url:          `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/webhook/github`,
          content_type: 'json',
          secret:       process.env.GITHUB_WEBHOOK_SECRET,
        },
      }
    )
    logger.info(`Webhook added: ${repoFullName}`)
    return response.data.id
  } catch (err) {
    logger.error(`addWebhook error: ${err.message}`)
    throw err
  }
}

// ── Remove Webhook ─────────────────────────────────────────
const removeWebhook = async (repoFullName, webhookId, token) => {
  try {
    const client = githubClient(token)
    await client.delete(`/repos/${repoFullName}/hooks/${webhookId}`)
    logger.info(`Webhook removed: ${repoFullName}`)
  } catch (err) {
    logger.error(`removeWebhook error: ${err.message}`)
  }
}

// ── Format Summary Comment ─────────────────────────────────
const formatSummaryComment = (review) => {
  const gradeEmoji = {
    A: '🟢', B: '🟡', C: '🟠', D: '🔴', F: '⛔'
  }

  const score = review.overallScore
  const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F'
  const emoji = gradeEmoji[grade]

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

---
*Powered by [CodeSense AI](${process.env.CLIENT_URL})*`
}

// ── Helper: Check supported file ───────────────────────────
const isSupportedFile = (filename) => {
  const supported = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c']
  return supported.some(ext => filename.endsWith(ext))
}
const fetchUserRepos = async (token) => {
  const client   = githubClient(token)
  const response = await client.get('/user/repos?per_page=100&sort=updated')
  return response.data.map(r => ({
    id:        r.id,
    name:      r.name,
    fullName:  r.full_name,
    language:  r.language,
    isPrivate: r.private,
    stars:     r.stargazers_count,
  }))
}

module.exports = {
  fetchPRFiles,
  fetchFileContent,
  postInlineComment,
  postSummaryComment,
  addWebhook,
  removeWebhook,
  formatSummaryComment,
  fetchUserRepos,
}