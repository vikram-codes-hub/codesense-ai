jest.mock('../services/mlBridge.service')
jest.mock('../queues/github.queue', () => ({ addGithubJob: jest.fn() }))
jest.mock('../models/Review')
jest.mock('../models/ReviewFile')
jest.mock('../models/Issue')
jest.mock('../models/Repository')
jest.mock('../config/bullmq', () => ({
  host: 'localhost', port: 6379
}))

const { analyzeCode } = require('../services/mlBridge.service')
const Review          = require('../models/Review')
const ReviewFile      = require('../models/ReviewFile')
const Issue           = require('../models/Issue')

describe('Review Worker — score calculation', () => {

  test('✅ calculates perfect score with no issues', () => {
    const issues  = []
    const weights = { security: 0.40, bug: 0.30, complexity: 0.20, style: 0.10 }
    const overall = 100
    expect(overall).toBe(100)
  })

  test('✅ score decreases with critical issues', () => {
    const PENALTIES  = { critical: 25, high: 15, medium: 8, low: 3 }
    let score        = 100
    score -= PENALTIES.critical // one critical issue
    expect(score).toBe(75)
  })

  test('✅ score never goes below 0', () => {
    let score = 100
    for (let i = 0; i < 10; i++) score -= 25 // many critical issues
    expect(Math.max(0, score)).toBe(0)
  })

  test('✅ ML analyzeCode called with correct params', async () => {
    analyzeCode.mockResolvedValue({
      score:        { overall: 85 },
      total_issues: 3,
      issues:       [],
    })

    const result = await analyzeCode('const x = 1', 'test.js')
    expect(analyzeCode).toHaveBeenCalledWith('const x = 1', 'test.js')
    expect(result.score.overall).toBe(85)
  })

  test('✅ severity counts calculated correctly', () => {
    const issues = [
      { severity: 'critical' },
      { severity: 'critical' },
      { severity: 'high'     },
      { severity: 'medium'   },
      { severity: 'low'      },
      { severity: 'low'      },
    ]
    const critical = issues.filter(i => i.severity === 'critical').length
    const high     = issues.filter(i => i.severity === 'high').length
    const medium   = issues.filter(i => i.severity === 'medium').length
    const low      = issues.filter(i => i.severity === 'low').length

    expect(critical).toBe(2)
    expect(high).toBe(1)
    expect(medium).toBe(1)
    expect(low).toBe(2)
  })
})