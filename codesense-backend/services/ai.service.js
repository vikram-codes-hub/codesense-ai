const axios  = require('axios')
const logger = require('../utils/logger')

// ── Gemini (Primary) ───────────────────────────────────────
const callGemini = async (prompt) => {
  const response = await axios.post(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 1000 },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
      },
      timeout: 30000,
    }
  )
  return response.data.candidates?.[0]?.content?.parts?.[0]?.text
}

// ── Groq (Fallback — free & fast) ─────────────────────────
const callGroq = async (prompt) => {
  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model:       'llama-3.3-70b-versatile',
      messages:    [{ role: 'user', content: prompt }],
      max_tokens:  1000,
      temperature: 0.3,
    },
    {
      headers: {
        Authorization:  `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  )
  return response.data.choices?.[0]?.message?.content
}

// ── Build prompt ───────────────────────────────────────────
const buildPrompt = (issue, fileContent, filename) => {
  const codeLines   = fileContent?.split('\n') || []
  const startLine   = Math.max(0, (issue.line || 1) - 5)
  const endLine     = Math.min(codeLines.length, (issue.line || 1) + 5)
  const codeSnippet = codeLines.slice(startLine, endLine).join('\n')

  return `You are a senior security engineer reviewing code. Analyze this issue and respond in JSON only.

FILE: ${filename}
LINE: ${issue.line || 'unknown'}
ISSUE TYPE: ${issue.type} (${issue.severity} severity)
ISSUE: ${issue.message}

CODE CONTEXT:
\`\`\`
${codeSnippet}
\`\`\`

Respond with ONLY this JSON (no markdown, no extra text):
{
  "explanation": "2-3 sentence explanation of why this is dangerous and what an attacker could do",
  "fixedCode": "the corrected code snippet only (not the whole file)",
  "fixDescription": "one sentence describing what you changed and why",
  "confidence": 95
}`
}

// ── Parse AI response ──────────────────────────────────────
const parseResponse = (text) => {
  try {
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Could not parse AI response')
  }
}

// ── Main: Get AI Fix ───────────────────────────────────────
const getAIFix = async (issue, fileContent, filename) => {
  const prompt = buildPrompt(issue, fileContent, filename)

  // Try Gemini first
  if (process.env.GEMINI_API_KEY) {
    try {
      logger.info(`AI fix: Gemini → ${filename}:${issue.line}`)
      const text   = await callGemini(prompt)
      const parsed = parseResponse(text)
      return { ...parsed, provider: 'gemini' }
    } catch (err) {
      logger.warn(`Gemini failed: ${err.message} — trying Groq`)
    }
  }

  // Fallback to Groq
  if (process.env.GROQ_API_KEY) {
    try {
      logger.info(`AI fix: Groq → ${filename}:${issue.line}`)
      const text   = await callGroq(prompt)
      const parsed = parseResponse(text)
      return { ...parsed, provider: 'groq' }
    } catch (err) {
      logger.warn(`Groq failed: ${err.message}`)
    }
  }

  return null
}

module.exports = { getAIFix }