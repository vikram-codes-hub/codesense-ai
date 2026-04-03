const crypto = require('crypto')

// Mock dependencies before requiring the service
jest.mock('../models/Repository')
jest.mock('../models/Review')
jest.mock('../models/User')
jest.mock('../queues/review.queue', () => ({ addReviewJob: jest.fn() }))
jest.mock('../socket', () => ({ emitReviewQueued: jest.fn() }))

const { verifySignature } = require('../services/webhook.service')

describe('verifySignature', () => {

  const secret  = 'test_secret'
  const payload = Buffer.from(JSON.stringify({ action: 'opened' }))

  beforeEach(() => {
    process.env.GITHUB_WEBHOOK_SECRET = secret
  })

  test('✅ returns true for valid signature', () => {
    const hmac      = crypto.createHmac('sha256', secret)
    const signature = 'sha256=' + hmac.update(payload).digest('hex')
    expect(verifySignature(payload, signature)).toBe(true)
  })

  test('❌ returns false for invalid signature', () => {
    expect(verifySignature(payload, 'sha256=invalidsignature123')).toBe(false)
  })

  test('❌ returns false for missing signature', () => {
    expect(verifySignature(payload, null)).toBe(false)
  })

  test('❌ returns false for empty signature', () => {
    expect(verifySignature(payload, '')).toBe(false)
  })

  test('❌ returns false for wrong secret', () => {
    const hmac      = crypto.createHmac('sha256', 'wrong_secret')
    const signature = 'sha256=' + hmac.update(payload).digest('hex')
    expect(verifySignature(payload, signature)).toBe(false)
  })
})1