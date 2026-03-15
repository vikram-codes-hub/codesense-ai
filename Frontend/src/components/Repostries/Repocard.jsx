import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GitBranch, Clock, Trash2, ExternalLink, Circle } from 'lucide-react'

const getScoreGrade = (score) => {
  if (score >= 90) return { grade: 'A', color: '#22c55e' }
  if (score >= 75) return { grade: 'B', color: '#84cc16' }
  if (score >= 60) return { grade: 'C', color: '#eab308' }
  if (score >= 40) return { grade: 'D', color: '#f97316' }
  return               { grade: 'F', color: '#ef4444' }
}

const formatDate = (date) => {
  if (!date) return null
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function RepoCard({ repo, onDisconnect }) {
  const navigate  = useNavigate()
  const [hovering,   setHovering]   = useState(false)
  const [confirming, setConfirming] = useState(false)

  const grade = repo.avgScore ? getScoreGrade(repo.avgScore) : null

  const handleDisconnect = (e) => {
    e.stopPropagation()
    if (!confirming) { setConfirming(true); return }
    onDisconnect(repo._id)
    setConfirming(false)
  }

  const handleCancel = (e) => {
    e.stopPropagation()
    setConfirming(false)
  }

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false); setConfirming(false) }}
      style={{
        background:  'var(--bg-secondary)',
        border:      `1px solid ${hovering ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 10,
        padding:     20,
        cursor:      'pointer',
        transition:  'all 0.2s',
        boxShadow:   hovering ? '0 0 16px var(--accent-glow)' : 'none',
        animation:   'slideUp 0.3s ease-out',
      }}
      onClick={() => navigate('/repositories')}
    >
      {/* ── Header ──────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GitBranch size={18} color="var(--accent)" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              {repo.repoName}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {repo.repoFullName}
            </div>
          </div>
        </div>

        {grade && (
          <div style={{
            padding: '4px 10px', borderRadius: 8,
            background: `${grade.color}15`,
            border: `1px solid ${grade.color}40`,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: grade.color }}>{repo.avgScore}</span>
            <span style={{ fontSize: 11, color: grade.color, fontWeight: 600 }}>{grade.grade}</span>
          </div>
        )}
      </div>

      {/* ── Info Row ────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        {repo.language && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Circle size={10} fill="var(--accent)" color="var(--accent)" />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{repo.language}</span>
          </div>
        )}
        {repo.lastReviewAt && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Clock size={12} color="var(--text-muted)" />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(repo.lastReviewAt)}</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: repo.isConnected ? 'var(--grade-a)' : 'var(--text-muted)',
          }} />
          <span style={{ fontSize: 12, color: repo.isConnected ? 'var(--grade-a)' : 'var(--text-muted)' }}>
            {repo.isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* ── Actions ─────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8 }}>
        <a
          href={`https://github.com/${repo.repoFullName}`}
          target="_blank" rel="noreferrer"
          onClick={e => e.stopPropagation()}
          style={{
            flex: 1, padding: '7px 0', borderRadius: 7,
            background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            textDecoration: 'none', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
        >
          <ExternalLink size={13} /> View on GitHub
        </a>

        {!confirming ? (
          <button
            onClick={handleDisconnect}
            style={{
              padding: '7px 12px', borderRadius: 7,
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 12, transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--critical)'; e.currentTarget.style.color = 'var(--critical)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <Trash2 size={13} /> Disconnect
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={handleDisconnect}
              style={{
                padding: '7px 10px', borderRadius: 7, fontSize: 12, fontWeight: 500,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                color: 'var(--critical)', cursor: 'pointer',
              }}
            >
              Confirm
            </button>
            <button
              onClick={handleCancel}
              style={{
                padding: '7px 10px', borderRadius: 7, fontSize: 12,
                background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}