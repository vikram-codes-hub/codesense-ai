// ── Mock User ──────────────────────────────────────────────────────────────
export const mockUser = {
  _id: 'user_001',
  name: 'Vikram Singh',
  email: 'vikram@codesense.dev',
  avatar: 'https://avatars.githubusercontent.com/u/583231?v=4',
  plan: 'pro',
  totalReviews: 24,
  githubId: 'vikramsingh',
  createdAt: '2024-01-15T10:00:00.000Z',
};

// ── Mock Repositories ──────────────────────────────────────────────────────
export const mockRepos = [
  {
    _id: 'repo_001',
    repoName: 'codesense-ai',
    repoFullName: 'vikramsingh/codesense-ai',
    githubRepoId: '123456789',
    isConnected: true,
    avgScore: 82,
    language: 'JavaScript',
    lastReviewAt: '2024-03-01T12:00:00.000Z',
  },
  {
    _id: 'repo_002',
    repoName: 'ecommerce-api',
    repoFullName: 'vikramsingh/ecommerce-api',
    githubRepoId: '987654321',
    isConnected: true,
    avgScore: 65,
    language: 'Python',
    lastReviewAt: '2024-02-28T09:00:00.000Z',
  },
  {
    _id: 'repo_003',
    repoName: 'portfolio-web',
    repoFullName: 'vikramsingh/portfolio-web',
    githubRepoId: '112233445',
    isConnected: true,
    avgScore: 91,
    language: 'TypeScript',
    lastReviewAt: '2024-02-25T15:00:00.000Z',
  },
  {
    _id: 'repo_004',
    repoName: 'ml-pipeline',
    repoFullName: 'vikramsingh/ml-pipeline',
    githubRepoId: '556677889',
    isConnected: false,
    avgScore: 44,
    language: 'Python',
    lastReviewAt: '2024-02-20T11:00:00.000Z',
  },
];

// ── Mock Reviews ───────────────────────────────────────────────────────────
export const mockReviews = [
  {
    _id: 'review_001',
    repoId: 'repo_001',
    repoName: 'codesense-ai',
    prNumber: 42,
    prTitle: 'feat: add real-time socket events for review pipeline',
    prUrl: 'https://github.com/vikramsingh/codesense-ai/pull/42',
    status: 'completed',
    overallScore: 82,
    securityScore: 90,
    bugScore: 78,
    complexityScore: 80,
    styleScore: 85,
    totalIssues: 8,
    criticalCount: 0,
    highCount: 2,
    mediumCount: 4,
    lowCount: 2,
    isManual: false,
    createdAt: '2024-03-01T12:00:00.000Z',
  },
  {
    _id: 'review_002',
    repoId: 'repo_002',
    repoName: 'ecommerce-api',
    prNumber: 17,
    prTitle: 'fix: patch SQL injection in product search endpoint',
    prUrl: 'https://github.com/vikramsingh/ecommerce-api/pull/17',
    status: 'completed',
    overallScore: 55,
    securityScore: 40,
    bugScore: 60,
    complexityScore: 65,
    styleScore: 70,
    totalIssues: 21,
    criticalCount: 3,
    highCount: 5,
    mediumCount: 8,
    lowCount: 5,
    isManual: false,
    createdAt: '2024-02-28T09:00:00.000Z',
  },
  {
    _id: 'review_003',
    repoId: 'repo_001',
    repoName: 'codesense-ai',
    prNumber: 41,
    prTitle: 'refactor: split review worker into smaller services',
    prUrl: 'https://github.com/vikramsingh/codesense-ai/pull/41',
    status: 'completed',
    overallScore: 91,
    securityScore: 95,
    bugScore: 88,
    complexityScore: 90,
    styleScore: 92,
    totalIssues: 3,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 2,
    lowCount: 1,
    isManual: false,
    createdAt: '2024-02-25T15:00:00.000Z',
  },
  {
    _id: 'review_004',
    repoId: 'repo_003',
    repoName: 'portfolio-web',
    prNumber: null,
    prTitle: 'Manual Review — auth.js',
    prUrl: null,
    status: 'completed',
    overallScore: 74,
    securityScore: 70,
    bugScore: 75,
    complexityScore: 78,
    styleScore: 80,
    totalIssues: 11,
    criticalCount: 1,
    highCount: 2,
    mediumCount: 5,
    lowCount: 3,
    isManual: true,
    createdAt: '2024-02-22T10:00:00.000Z',
  },
  {
    _id: 'review_005',
    repoId: 'repo_002',
    repoName: 'ecommerce-api',
    prNumber: 16,
    prTitle: 'feat: add stripe payment integration',
    prUrl: 'https://github.com/vikramsingh/ecommerce-api/pull/16',
    status: 'failed',
    overallScore: null,
    securityScore: null,
    bugScore: null,
    complexityScore: null,
    styleScore: null,
    totalIssues: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    isManual: false,
    createdAt: '2024-02-20T08:00:00.000Z',
  },
  {
    _id: 'review_006',
    repoId: 'repo_001',
    repoName: 'codesense-ai',
    prNumber: 43,
    prTitle: 'feat: add dashboard analytics charts',
    prUrl: 'https://github.com/vikramsingh/codesense-ai/pull/43',
    status: 'processing',
    overallScore: null,
    securityScore: null,
    bugScore: null,
    complexityScore: null,
    styleScore: null,
    totalIssues: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    isManual: false,
    createdAt: '2024-03-02T14:00:00.000Z',
  },
];

// ── Mock Review Files ──────────────────────────────────────────────────────
export const mockReviewFiles = [
  {
    _id: 'file_001',
    reviewId: 'review_001',
    filename: 'src/workers/review.worker.js',
    language: 'javascript',
    score: 78,
    totalIssues: 4,
    content: `const { Worker } = require('bullmq');
const connection = require('../config/bullmq');
const mlBridge = require('../services/mlBridge.service');
const Review = require('../models/Review');
const ReviewFile = require('../models/ReviewFile');
const Issue = require('../models/Issue');
const { addGithubJob } = require('../queues/github.queue');
const logger = require('../utils/logger');
const password = "admin123"; // hardcoded secret

const reviewWorker = new Worker('review', async (job) => {
  const { reviewId, files, repoFullName, prNumber } = job.data;

  try {
    await Review.findByIdAndUpdate(reviewId, { status: 'processing' });

    const results = [];

    for (const file of files) {
      const analysis = await mlBridge.analyzeCode(file.content, file.filename);
      
      const reviewFile = await ReviewFile.create({
        reviewId,
        filename: file.filename,
        language: analysis.language,
        content: file.content,
        score: analysis.score,
        totalIssues: analysis.issues.length,
      });

      results.push({ reviewFile, issues: analysis.issues });
    }

    let totalIssues = 0;
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;

    for (const result of results) {
      for (const issue of result.issues) {
        await Issue.create({ ...issue, reviewId, fileId: result.reviewFile._id });
        totalIssues++;
        if (issue.severity === 'critical') criticalCount++;
        if (issue.severity === 'high') highCount++;
        if (issue.severity === 'medium') mediumCount++;
        if (issue.severity === 'low') lowCount++;
      }
    }

    await Review.findByIdAndUpdate(reviewId, {
      status: 'completed',
      totalIssues,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
    });

    await addGithubJob({ reviewId, repoFullName, prNumber });

  } catch (error) {
    logger.error('Review worker error: ' + error.message);
    await Review.findByIdAndUpdate(reviewId, { status: 'failed' });
  }
}, { connection });

module.exports = { reviewWorker };`,
  },
  {
    _id: 'file_002',
    reviewId: 'review_001',
    filename: 'src/services/mlBridge.service.js',
    language: 'javascript',
    score: 88,
    totalIssues: 2,
    content: `const axios = require('axios');
const logger = require('../utils/logger');

const analyzeCode = async (content, filename) => {
  try {
    const response = await axios.post(
      process.env.ML_SERVICE_URL + '/api/analyze',
      { content, filename },
      { timeout: 30000 }
    );
    return response.data;
  } catch (error) {
    logger.error('ML Bridge error: ' + error.message);
    throw error;
  }
};

module.exports = { analyzeCode };`,
  },
  {
    _id: 'file_003',
    reviewId: 'review_001',
    filename: 'src/controllers/auth.controller.js',
    language: 'javascript',
    score: 80,
    totalIssues: 2,
    content: `const User = require('../models/User');
const { generateToken } = require('../utils/jwt.utils');
const { successResponse, errorResponse } = require('../utils/response.utils');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return errorResponse(res, 'Email already exists', 400);
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    return successResponse(res, { token, user }, 'Registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return errorResponse(res, 'Invalid credentials', 401);
    }
    const token = generateToken(user._id);
    return successResponse(res, { token, user }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };`,
  },
];

// ── Mock Issues ────────────────────────────────────────────────────────────
export const mockIssues = [
  {
    _id: 'issue_001',
    reviewId: 'review_001',
    fileId: 'file_001',
    filename: 'src/workers/review.worker.js',
    type: 'security',
    severity: 'high',
    line: 9,
    column: 5,
    message: 'Hardcoded password detected',
    description: 'A plaintext password is hardcoded directly in the source code, exposing sensitive credentials.',
    suggestion: 'Move secrets to environment variables and access via process.env.PASSWORD',
    code: 'const password = "admin123";',
    isPostedToGitHub: true,
  },
  {
    _id: 'issue_002',
    reviewId: 'review_001',
    fileId: 'file_001',
    filename: 'src/workers/review.worker.js',
    type: 'bug',
    severity: 'medium',
    line: 34,
    column: 8,
    message: 'Missing error handling for Issue.create()',
    description: 'The Issue.create() call inside the loop is not individually wrapped in try-catch, meaning one failure could break the entire batch.',
    suggestion: 'Wrap individual Issue.create() in try-catch to handle partial failures gracefully.',
    code: 'await Issue.create({ ...issue, reviewId, fileId: result.reviewFile._id });',
    isPostedToGitHub: true,
  },
  {
    _id: 'issue_003',
    reviewId: 'review_001',
    fileId: 'file_001',
    filename: 'src/workers/review.worker.js',
    type: 'complexity',
    severity: 'medium',
    line: 12,
    column: 1,
    message: 'Function cyclomatic complexity is 14',
    description: 'High cyclomatic complexity makes this function hard to test and maintain.',
    suggestion: 'Break this function into smaller focused functions: one for file analysis, one for saving results.',
    code: 'const reviewWorker = new Worker("review", async (job) => {',
    isPostedToGitHub: false,
  },
  {
    _id: 'issue_004',
    reviewId: 'review_001',
    fileId: 'file_001',
    filename: 'src/workers/review.worker.js',
    type: 'style',
    severity: 'low',
    line: 55,
    column: 1,
    message: 'Function exceeds 50 lines',
    description: 'This function is 58 lines long. Long functions are harder to read and maintain.',
    suggestion: 'Extract the issue counting logic into a separate helper function.',
    code: null,
    isPostedToGitHub: false,
  },
  {
    _id: 'issue_005',
    reviewId: 'review_001',
    fileId: 'file_002',
    filename: 'src/services/mlBridge.service.js',
    type: 'bug',
    severity: 'high',
    line: 11,
    column: 5,
    message: 'Error is swallowed after logging',
    description: 'The error is logged but then re-thrown without context, losing the original stack trace.',
    suggestion: 'Use "throw new Error(`ML analysis failed: ${error.message}`)" to preserve context.',
    code: 'throw error;',
    isPostedToGitHub: true,
  },
  {
    _id: 'issue_006',
    reviewId: 'review_001',
    fileId: 'file_002',
    filename: 'src/services/mlBridge.service.js',
    type: 'style',
    severity: 'low',
    line: 3,
    column: 1,
    message: 'Magic number used for timeout',
    description: 'The value 30000 is a magic number with no explanation of its purpose.',
    suggestion: 'Extract to a named constant: const ML_TIMEOUT_MS = 30000;',
    code: '{ timeout: 30000 }',
    isPostedToGitHub: false,
  },
  {
    _id: 'issue_007',
    reviewId: 'review_001',
    fileId: 'file_003',
    filename: 'src/controllers/auth.controller.js',
    type: 'security',
    severity: 'medium',
    line: 8,
    column: 3,
    message: 'No input validation before database query',
    description: 'User input is passed directly to User.findOne() without sanitization or validation.',
    suggestion: 'Use express-validator or joi to validate and sanitize email and password before use.',
    code: 'const existing = await User.findOne({ email });',
    isPostedToGitHub: false,
  },
  {
    _id: 'issue_008',
    reviewId: 'review_001',
    fileId: 'file_003',
    filename: 'src/controllers/auth.controller.js',
    type: 'bug',
    severity: 'medium',
    line: 22,
    column: 5,
    message: 'Password field may be exposed in response',
    description: 'The user object returned in successResponse may include the password field if select("+password") was used.',
    suggestion: 'Explicitly exclude password: const { password, ...safeUser } = user.toObject();',
    code: 'return successResponse(res, { token, user }, "Login successful");',
    isPostedToGitHub: false,
  },
];

// ── Mock Dashboard Stats ───────────────────────────────────────────────────
export const mockDashboardStats = {
  totalReviews: 24,
  avgScore: 76,
  totalIssues: 187,
  criticalIssues: 9,
  connectedRepos: 3,
  reviewsThisWeek: 6,
  scoreChange: +4,        // compared to last week
  issuesChange: -12,      // compared to last week
};

// ── Mock Activity Chart (score over time) ─────────────────────────────────
export const mockActivityChart = [
  { date: 'Feb 1',  score: 61 },
  { date: 'Feb 5',  score: 58 },
  { date: 'Feb 8',  score: 70 },
  { date: 'Feb 12', score: 65 },
  { date: 'Feb 15', score: 74 },
  { date: 'Feb 18', score: 71 },
  { date: 'Feb 20', score: 68 },
  { date: 'Feb 22', score: 74 },
  { date: 'Feb 25', score: 91 },
  { date: 'Feb 28', score: 55 },
  { date: 'Mar 1',  score: 82 },
  { date: 'Mar 2',  score: 78 },
];

// ── Mock Live Feed Events ──────────────────────────────────────────────────
export const mockLiveFeed = [
  { id: 1, event: 'review:queued',    message: 'Review queued for PR #43',                    time: '14:00:01' },
  { id: 2, event: 'review:started',   message: 'Analysis started — 3 files detected',          time: '14:00:03' },
  { id: 3, event: 'review:file:done', message: 'review.worker.js — Score: 78 — 4 issues',      time: '14:00:06' },
  { id: 4, event: 'review:file:done', message: 'mlBridge.service.js — Score: 88 — 2 issues',   time: '14:00:08' },
  { id: 5, event: 'review:file:done', message: 'auth.controller.js — Score: 80 — 2 issues',    time: '14:00:10' },
  { id: 6, event: 'review:complete',  message: 'Review complete — Overall Score: 82 — 8 issues', time: '14:00:11' },
  { id: 7, event: 'review:posted',    message: 'Comments posted to GitHub PR #43',             time: '14:00:13' },
];

// ── Mock Recent Reviews (dashboard) ───────────────────────────────────────
export const mockRecentReviews = mockReviews.slice(0, 5);

// ── Helpers ────────────────────────────────────────────────────────────────
export const getScoreGrade = (score) => {
  if (score >= 90) return { grade: 'A', label: 'Excellent',       color: '#22c55e' };
  if (score >= 75) return { grade: 'B', label: 'Good',            color: '#84cc16' };
  if (score >= 60) return { grade: 'C', label: 'Needs Work',      color: '#eab308' };
  if (score >= 40) return { grade: 'D', label: 'Poor',            color: '#f97316' };
  return             { grade: 'F', label: 'Critical Issues',  color: '#ef4444' };
};

export const getSeverityColor = (severity) => {
  switch (severity) {
    case 'critical': return '#ef4444';
    case 'high':     return '#f97316';
    case 'medium':   return '#eab308';
    case 'low':      return '#3b82f6';
    default:         return '#6b7280';
  }
};

export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};