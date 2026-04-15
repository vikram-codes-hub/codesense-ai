const { Worker }       = require('bullmq')
const Review           = require('../models/Review')
const ReviewFile       = require('../models/ReviewFile')
const Issue            = require('../models/Issue')
const Repository       = require('../models/Repository')
const { analyzeCode }  = require('../services/mlBridge.service')
const { addGithubJob } = require('../queues/github.queue')
const { 
  emitReviewStarted, 
  emitReviewFileDone, 
  emitReviewComplete, 
  emitReviewFailed 
} = require('../socket')
const connection       = require('../config/bullmq')
const logger           = require('../utils/logger')

const initReviewWorker = (redisConnection) => {
  const worker = new Worker('review', async (job) => {
    const { reviewId, isManual, files, repoFullName, prNumber, githubToken } = job.data

    logger.info(`Processing review job → reviewId: ${reviewId}`)
    const startTime = Date.now()

    // ── Step 1: Mark as running ───────────────────────────
    await Review.findByIdAndUpdate(reviewId, { status: 'running' })

    emitReviewStarted(reviewId, {
      totalFiles: files.length,
    })

    // ── Step 2: Analyze each file ─────────────────────────
    const allIssues = []

    for (const file of files) {
      try {
        logger.info(`Analyzing: ${file.filename}`)

        // Call Python ML service
        const result = await analyzeCode(file.content, file.filename)

        // Save file to DB
        const reviewFile = await ReviewFile.create({
          reviewId,
          filename:    file.filename,
          language:    file.language || result.language,
          content:     file.content,
          score: result.score?.overall ?? result.score ?? null,
          totalIssues: result.total_issues || 0,
        })

        // Save issues for this file
        if (result.issues && result.issues.length > 0) {
          const issuesDocs = result.issues.map(issue => ({
            reviewId,
            fileId:      reviewFile._id,
            filename:    file.filename,
            type:        issue.type,
            severity:    issue.severity,
            line:        issue.line,
            column:      issue.column,
            message:     issue.message,
            description: issue.description,
            suggestion:  issue.suggestion,
            code:        issue.code,
          }))
          await Issue.insertMany(issuesDocs)
          allIssues.push(...result.issues)
        }

        // Emit per-file progress
        emitReviewFileDone(reviewId, {
          filename:    file.filename,
          fileScore:   result.score        || 0,
          issuesFound: result.total_issues || 0,
        })

      } catch (fileErr) {
        logger.error(`Failed to analyze ${file.filename}: ${fileErr.message}`)
      }
    }

    // ── Step 3: Calculate scores ──────────────────────────
    const scores = _calculateOverallScores(allIssues)

    // ── Step 4: Count severities ──────────────────────────
    const criticalCount = allIssues.filter(i => i.severity === 'critical').length
    const highCount     = allIssues.filter(i => i.severity === 'high').length
    const mediumCount   = allIssues.filter(i => i.severity === 'medium').length
    const lowCount      = allIssues.filter(i => i.severity === 'low').length

    // ── Step 5: Generate summary ──────────────────────────
    const summary       = _generateSummary(scores.overall, criticalCount, highCount, allIssues.length)
    const executionTime = Date.now() - startTime

    // ── Step 6: Update review as completed ────────────────
    await Review.findByIdAndUpdate(reviewId, {
      status:          'completed',
      overallScore:    scores.overall,
      securityScore:   scores.security,
      bugScore:        scores.bug,
      complexityScore: scores.complexity,
      styleScore:      scores.style,
      grade:           scores.grade,
      gradeLabel:      scores.gradeLabel,
      totalIssues:     allIssues.length,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      filesAnalyzed:   files.length,
      summary,
      executionTime,
      completedAt:     new Date(),
    })

    // ── Step 7: Update repo stats ─────────────────────────
    if (!isManual) {
      const review = await Review.findById(reviewId)
      if (review?.repoId) {
        const repoReviews = await Review.find({ repoId: review.repoId, status: 'completed' })
        const avgScore    = repoReviews.reduce((sum, r) => sum + (r.overallScore || 0), 0) / repoReviews.length
        await Repository.findByIdAndUpdate(review.repoId, {
          lastReviewAt: new Date(),
          totalReviews: repoReviews.length,
          avgScore:     Math.round(avgScore),
        })
      }
    }

    // ── Step 8: Emit completion ───────────────────────────
    emitReviewComplete(reviewId, {
      overallScore: scores.overall,
      totalIssues:  allIssues.length,
      criticalCount,
      grade:        scores.grade,
      summary,
      executionTime,
    })

    logger.info(`Review complete → score: ${scores.overall}/100 | issues: ${allIssues.length} | time: ${executionTime}ms`)

    // ── Step 9: Queue GitHub comments ────────────────────
    if (!isManual && prNumber && githubToken) {
      await addGithubJob({
        reviewId,
        repoFullName,
        prNumber,
        githubToken,
        overallScore: scores.overall,
        grade:        scores.grade,
        summary,
        criticalCount,
        totalIssues:  allIssues.length,
      })
    }

    return { reviewId, overallScore: scores.overall }

  }, {
    connection:  redisConnection,
    concurrency: 2,
    settings: {
      lockDuration:    60000, // 60 seconds
      lockRenewTime:   15000, // Renew every 15 seconds
      maxStalledCount: 2,
      stalledInterval: 30000, // Check every 30 seconds
      retryProcessDelay: 5000, // Wait 5 sec before retry
    }
  })

  worker.on('completed', (job) => {
    logger.info(`Review worker: job ${job.id} completed`)
  })

  worker.on('failed', async (job, err) => {
    logger.error(`Review worker: job ${job.id} failed: ${err.message}`)
    if (job.data.reviewId) {
      await Review.findByIdAndUpdate(job.data.reviewId, {
        status: 'failed',
        error:  err.message,
      })
      emitReviewFailed(job.data.reviewId, {
        error:    err.message,
      })
    }
  })

  worker.on('error', (err) => {
    logger.error(`Review worker error: ${err.message}`)
  })

  logger.info('Review worker initialized')
  return worker
}

// ── Helpers ───────────────────────────────────────────────
const SEVERITY_PENALTIES = { critical: 25, high: 15, medium: 8, low: 3 }
const WEIGHTS            = { security: 0.40, bug: 0.30, complexity: 0.20, style: 0.10 }

const _calculateOverallScores = (issues) => {
  const byType = { security: [], bug: [], complexity: [], style: [] }
  issues.forEach(issue => {
    if (byType[issue.type]) byType[issue.type].push(issue)
  })

  const calcScore = (list) => {
    let score = 100
    list.forEach(i => { score -= (SEVERITY_PENALTIES[i.severity] || 3) })
    return Math.max(0, score)
  }

  const security   = calcScore(byType.security)
  const bug        = calcScore(byType.bug)
  const complexity = calcScore(byType.complexity)
  const style      = calcScore(byType.style)
  const overall    = Math.round(
    security   * WEIGHTS.security   +
    bug        * WEIGHTS.bug        +
    complexity * WEIGHTS.complexity +
    style      * WEIGHTS.style
  )

  const { grade, gradeLabel } = _getGrade(overall)
  return { overall, security, bug, complexity, style, grade, gradeLabel }
}

const _getGrade = (score) => {
  if (score >= 90) return { grade: 'A', gradeLabel: 'Excellent' }
  if (score >= 75) return { grade: 'B', gradeLabel: 'Good' }
  if (score >= 60) return { grade: 'C', gradeLabel: 'Needs Work' }
  if (score >= 40) return { grade: 'D', gradeLabel: 'Poor' }
  return             { grade: 'F', gradeLabel: 'Critical Issues' }
}

const _generateSummary = (score, critical, high, total) => {
  if (total === 0)  return 'No issues found. Excellent code quality!'
  if (critical > 0) return `Found ${critical} critical issue${critical > 1 ? 's' : ''} that must be fixed immediately. Score: ${score}/100.`
  if (high > 0)     return `Found ${high} high severity issue${high > 1 ? 's' : ''}. Review before merging. Score: ${score}/100.`
  return `Found ${total} minor issue${total > 1 ? 's' : ''}. Code quality score: ${score}/100.`
}

// ── Init ──────────────────────────────────────────────────
const reviewWorker = initReviewWorker(connection)

module.exports = { reviewWorker }