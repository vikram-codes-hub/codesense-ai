import { useState } from 'react'
import SeverityBadge from './SeverityBadge'
import { useReview } from '../../hooks/useReview'
import {
  ChevronDown, ChevronUp, MapPin, Lightbulb,
  Sparkles, Copy, Check, Loader, Zap
} from 'lucide-react'

const providerColors = {
  gemini: { color: '#4285f4', label: 'Gemini AI'  },
  groq:   { color: '#f55036', label: 'Groq AI'    },
  grok:   { color: '#1d9bf0', label: 'Grok AI'    },
}

export default function IssueCard({ issue, reviewId }) {
  const [expanded,    setExpanded]    = useState(false)
  const [aiFix,       setAiFix]       = useState(
    issue.aiExplanation ? {
      explanation:    issue.aiExplanation,
      fixedCode:      issue.aiFixedCode,
      fixDescription: issue.aiFixDescription,
      confidence:     issue.aiConfidence,
      provider:       issue.aiProvider,
    } : null
  )
  const [aiLoading,   setAiLoading]   = useState(false)
  const [showAiFix,   setShowAiFix]   = useState(false)
  const [copied,      setCopied]      = useState(false)
  const { getAIFix } = useReview()

  const typeColors = {
    security:   '#ef4444',
    bug:        '#f97316',
    complexity: '#6366f1',
    style:      '#22c55e',
  }

  const handleGetAIFix = async (e) => {
    e.stopPropagation()
    if (aiFix) { setShowAiFix(!showAiFix); return }
    setAiLoading(true)
    setExpanded(true)
    try {
      const result = await getAIFix(reviewId, issue._id)
      setAiFix(result)
      setShowAiFix(true)
    } catch {
      // error already toasted
    } finally {
      setAiLoading(false)
    }
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const provider = providerColors[aiFix?.provider] || providerColors.gemini

  return (
    <div style={{
      background:  'var(--bg-secondary)',
      border:      '1px solid var(--border)',
      borderLeft:  `3px solid ${typeColors[issue.type]}`,
      borderRadius: 8,
      overflow:    'hidden',
      transition:  'all 0.2s',
    }}>
      {/* ── Header ──────────────────────────────── */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '12px 14px', cursor: 'pointer',
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <SeverityBadge severity={issue.severity} />
            <span style={{
              fontSize: 11, color: typeColors[issue.type],
              background: `${typeColors[issue.type]}15`,
              border: `1px solid ${typeColors[issue.type]}30`,
              padding: '1px 6px', borderRadius: 4, fontWeight: 500,
              textTransform: 'capitalize',
            }}>
              {issue.type}
            </span>
            {issue.line && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <MapPin size={10} /> Line {issue.line}
              </span>
            )}
            {aiFix && (
              <span style={{
                fontSize: 10, fontWeight: 600,
                color: provider.color,
                background: `${provider.color}15`,
                border: `1px solid ${provider.color}30`,
                padding: '1px 6px', borderRadius: 4,
                display: 'flex', alignItems: 'center', gap: 3,
              }}>
                <Sparkles size={9} /> AI Fixed
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, margin: 0 }}>
            {issue.message}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {/* AI Fix button */}
          {reviewId && (
            <button
              onClick={handleGetAIFix}
              disabled={aiLoading}
              style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 11,
                fontWeight: 600, cursor: aiLoading ? 'not-allowed' : 'pointer',
                border: 'none',
                background: aiFix
                  ? `${provider.color}15`
                  : 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))',
                color: aiFix ? provider.color : 'var(--accent)',
                display: 'flex', alignItems: 'center', gap: 4,
                transition: 'all 0.2s',
                opacity: aiLoading ? 0.7 : 1,
              }}
            >
              {aiLoading
                ? <><Loader size={11} style={{ animation: 'spin 0.8s linear infinite' }} /> Fixing...</>
                : aiFix
                  ? <><Sparkles size={11} /> {showAiFix ? 'Hide Fix' : 'Show Fix'}</>
                  : <><Zap size={11} /> AI Fix</>
              }
            </button>
          )}
          <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      {/* ── Expanded ────────────────────────────── */}
      {expanded && (
        <div style={{
          padding: '0 14px 14px',
          borderTop: '1px solid var(--border)',
          animation: 'slideUp 0.2s ease-out',
        }}>

          {/* Description */}
          {issue.description && (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '12px 0 10px', lineHeight: 1.6 }}>
              {issue.description}
            </p>
          )}

          {/* Code snippet */}
          {issue.code && (
            <div style={{
              padding: '8px 12px', borderRadius: 6,
              background: 'var(--bg-primary)', border: '1px solid var(--border)',
              marginBottom: 10,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12, color: 'var(--text-secondary)', overflow: 'auto',
            }}>
              {issue.code}
            </div>
          )}

          {/* Suggestion */}
          {issue.suggestion && (
            <div style={{
              padding: '10px 12px', borderRadius: 6,
              background: 'rgba(99,102,241,0.06)',
              border: '1px solid rgba(99,102,241,0.2)',
              display: 'flex', gap: 8, alignItems: 'flex-start',
              marginBottom: aiFix && showAiFix ? 12 : 0,
            }}>
              <Lightbulb size={14} color="var(--accent)" style={{ marginTop: 1, flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                {issue.suggestion}
              </p>
            </div>
          )}

          {/* ── AI Fix Panel ─────────────────────── */}
          {aiFix && showAiFix && (
            <div style={{
              marginTop: 12, borderRadius: 8,
              border: `1px solid ${provider.color}30`,
              background: `${provider.color}08`,
              overflow: 'hidden',
              animation: 'slideUp 0.3s ease-out',
            }}>
              {/* AI Fix Header */}
              <div style={{
                padding: '8px 12px',
                borderBottom: `1px solid ${provider.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: `${provider.color}10`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={13} color={provider.color} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: provider.color }}>
                    {provider.label} Fix
                  </span>
                  {aiFix.confidence && (
                    <span style={{
                      fontSize: 10, color: '#22c55e',
                      background: 'rgba(34,197,94,0.1)',
                      padding: '1px 6px', borderRadius: 4,
                      border: '1px solid rgba(34,197,94,0.2)',
                    }}>
                      {aiFix.confidence}% confidence
                    </span>
                  )}
                </div>
              </div>

              <div style={{ padding: 12 }}>
                {/* Explanation */}
                {aiFix.explanation && (
                  <div style={{ marginBottom: 10 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Why it's dangerous
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                      {aiFix.explanation}
                    </p>
                  </div>
                )}

                {/* Fixed Code */}
                {aiFix.fixedCode && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#22c55e', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        ✅ Fixed Code
                      </p>
                      <button
                        onClick={() => handleCopy(aiFix.fixedCode)}
                        style={{
                          background: 'transparent', border: 'none',
                          cursor: 'pointer', color: 'var(--text-muted)',
                          display: 'flex', alignItems: 'center', gap: 4,
                          fontSize: 11, padding: '2px 6px', borderRadius: 4,
                        }}
                      >
                        {copied ? <><Check size={11} color="#22c55e" /> Copied!</> : <><Copy size={11} /> Copy</>}
                      </button>
                    </div>
                    <div style={{
                      padding: '10px 12px', borderRadius: 6,
                      background: 'rgba(34,197,94,0.05)',
                      border: '1px solid rgba(34,197,94,0.2)',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 12, color: '#22c55e',
                      overflow: 'auto', whiteSpace: 'pre-wrap',
                    }}>
                      {aiFix.fixedCode}
                    </div>
                  </div>
                )}

                {/* Fix Description */}
                {aiFix.fixDescription && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>
                    💡 {aiFix.fixDescription}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Loading state */}
          {aiLoading && (
            <div style={{
              marginTop: 12, padding: '16px', borderRadius: 8,
              border: '1px solid rgba(99,102,241,0.2)',
              background: 'rgba(99,102,241,0.05)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <Loader size={16} color="var(--accent)" style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 13, color: 'var(--text-primary)', margin: '0 0 2px', fontWeight: 500 }}>
                  Generating AI fix...
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                  Analyzing code context with Gemini AI
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}