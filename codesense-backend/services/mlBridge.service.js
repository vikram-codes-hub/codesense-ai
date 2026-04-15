const axios  = require('axios')
const logger = require('../utils/logger')

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000'
const ML_TIMEOUT     = 30000 // 30 seconds (matches ML service 25s + buffer)

//Analyze single file with retry
const analyzeCode = async (content, filename, retries = 2) => {
  let lastError = null
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info(`ML analysis: ${filename} (attempt ${attempt}/${retries})`)

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
      lastError = err
      
      // Handle specific error codes
      if (err.response?.status === 413) {
        throw new Error('Code file too large (max 1MB)')
      }
      if (err.response?.status === 504) {
        logger.error(`ML Service timeout on ${filename} (attempt ${attempt}): Code too complex or large`)
        throw new Error('Analysis timeout - code too complex or large')
      }
      if (err.response?.status === 400) {
        throw new Error(`ML analysis failed: Invalid input - ${err.response?.data?.error || err.message}`)
      }
      
      logger.error(`ML Bridge error for ${filename} (attempt ${attempt}): ${err.message}`)
      
      // Don't retry on validation errors or timeouts
      if (err.response?.status && [400, 413, 504].includes(err.response.status)) {
        throw new Error(err.response?.data?.error || err.message)
      }
      
      // Wait before retrying
      if (attempt < retries) {
        logger.info(`Retrying in 2 seconds...`)
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
  }
  
  throw new Error(`ML analysis failed after ${retries} attempts: ${lastError?.message || 'Unknown error'}`)
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