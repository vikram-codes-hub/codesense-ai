const axios  = require('axios')
const logger = require('../utils/logger')

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000'
const ML_TIMEOUT     = 60000 // 60 seconds

//Analyze single file
const analyzeCode = async (content, filename) => {
  try {
    logger.info(`ML analysis: ${filename}`)

    // Detect language from filename
    const ext     = filename.split('.').pop().toLowerCase()
    const langMap = {
      js: 'javascript', jsx: 'javascript',
      ts: 'typescript', tsx: 'typescript',
      py: 'python', java: 'java', cpp: 'cpp', c: 'c',
    }
    const language = langMap[ext] || 'javascript'

    const response = await axios.post(
      `${ML_SERVICE_URL}/api/analyze`,
      {
        code:     content,   
        language: language, 
        filename: filename,
      },
      { timeout: ML_TIMEOUT }
    )

    return response.data

  } catch (err) {
    logger.error(`ML Bridge error for ${filename}: ${err.message}`)
    throw new Error(`ML analysis failed: ${err.message}`)
  }
}

//Health check
const checkHealth = async () => {
  try {
    const response = await axios.get(
      `${ML_SERVICE_URL}/api/health`,
      { timeout: 5000 }
    )
    return response.data.status === 'ok'
  } catch (err) {
    logger.error(`ML service health check failed: ${err.message}`)
    return false
  }
}

module.exports = { analyzeCode, checkHealth }