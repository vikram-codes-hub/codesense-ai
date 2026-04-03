jest.mock('../models/User')
jest.mock('../utils/jwt.utils')

const User     = require('../models/User')
const { generateToken } = require('../utils/jwt.utils')

describe('Auth Controller — register', () => {

  const mockRes = () => {
    const res = {}
    res.status = jest.fn().mockReturnValue(res)
    res.json   = jest.fn().mockReturnValue(res)
    return res
  }

  const mockReq = (body) => ({ body })

  test('✅ registers user with valid data', async () => {
    const { register } = require('../controllers/auth.controller')

    User.findOne      = jest.fn().mockResolvedValue(null)
    User.create       = jest.fn().mockResolvedValue({
      _id:   '123',
      name:  'Test User',
      email: 'test@test.com',
      plan:  'free',
    })
    generateToken = jest.fn().mockReturnValue('mock_token')

    const req = mockReq({ name: 'Test User', email: 'test@test.com', password: 'password123' })
    const res = mockRes()
    const next = jest.fn()

    await register(req, res, next)
    expect(res.status).toHaveBeenCalledWith(201)
  })

  test('❌ fails if email already exists', async () => {
    const { register } = require('../controllers/auth.controller')

    User.findOne = jest.fn().mockResolvedValue({ email: 'test@test.com' })

    const req  = mockReq({ name: 'Test', email: 'test@test.com', password: '123456' })
    const res  = mockRes()
    const next = jest.fn()

    await register(req, res, next)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  test('❌ fails if required fields missing', async () => {
    const { register } = require('../controllers/auth.controller')

    const req  = mockReq({ email: 'test@test.com' }) // missing name + password
    const res  = mockRes()
    const next = jest.fn()

    await register(req, res, next)
    expect(res.status).toHaveBeenCalledWith(400)
  })
})