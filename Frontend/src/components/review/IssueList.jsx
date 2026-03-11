import IssueCard from './IssueCard'
import { mockIssues } from '../../utils/mockData'
import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'

const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }

export default function IssueList({ issues = mockIssues, selectedFile = null }) {
  const [filter, setFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const filtered = issues
    .filter(i => selectedFile ? i.filename === selectedFile : true)
    .filter(i => filter === 'all' ? true : i.severity === filter)
    .filter(i => typeFilter === 'all' ? true : i.type === typeFilter)
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  const severities = ['all', 'critical', 'high', 'medium', 'low']
  const types = ['all', 'security', 'bug', 'complexity', 'style']

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* ── Header ──────────────────────────────── */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Issues
            <span style={{
              marginLeft: 8, fontSize: 12,
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              padding: '1px 7px', borderRadius: 10,
              color: 'var(--text-muted)',
            }}>
              {filtered.length}
            </span>
          </h3>
        </div>

        {/* Severity filters */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
          {severities.map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '3px 9px', borderRadius: 6, fontSize: 11,
              fontWeight: 500, cursor: 'pointer', border: 'none',
              background: filter === s ? 'var(--accent)' : 'var(--bg-tertiary)',
              color: filter === s ? 'white' : 'var(--text-muted)',
              transition: 'all 0.15s', textTransform: 'capitalize',
            }}>
              {s}
            </button>
          ))}
        </div>

        {/* Type filters */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {types.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} style={{
              padding: '3px 9px', borderRadius: 6, fontSize: 11,
              fontWeight: 500, cursor: 'pointer', border: 'none',
              background: typeFilter === t ? 'rgba(99,102,241,0.2)' : 'var(--bg-tertiary)',
              color: typeFilter === t ? 'var(--accent)' : 'var(--text-muted)',
              transition: 'all 0.15s', textTransform: 'capitalize',
            }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Issues ──────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <AlertTriangle size={32} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No issues found</p>
          </div>
        ) : (
          filtered.map(issue => <IssueCard key={issue._id} issue={issue} />)
        )}
      </div>
    </div>
  )
}