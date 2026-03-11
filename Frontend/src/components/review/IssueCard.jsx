import { useState } from 'react'
import SeverityBadge from './SeverityBadge'
import { ChevronDown, ChevronUp, MapPin, Lightbulb } from 'lucide-react'

export default function IssueCard({ issue }) {
  const [expanded, setExpanded] = useState(false)

  const typeColors = {
    security:   '#ef4444',
    bug:        '#f97316',
    complexity: '#6366f1',
    style:      '#22c55e',
  }

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderLeft: `3px solid ${typeColors[issue.type]}`,
      borderRadius: 8,
      overflow: 'hidden',
      transition: 'all 0.2s',
    }}>
      {/* ── Header ──────────────────────────────── */}
      <div
        style={{
          padding: '12px 14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
        }}
        onClick={() => setExpanded(!expanded)}
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
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, margin: 0 }}>
            {issue.message}
          </p>
        </div>
        <div style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              marginBottom: 10,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12, color: 'var(--text-secondary)',
              overflow: 'auto',
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
            }}>
              <Lightbulb size={14} color="var(--accent)" style={{ marginTop: 1, flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                {issue.suggestion}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}