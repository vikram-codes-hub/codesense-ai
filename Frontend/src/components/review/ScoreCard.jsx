import { mockReviews } from '../../utils/mockData'
import { getScoreGrade } from '../../utils/mockData'
import { Shield, Bug, Zap, Palette } from 'lucide-react'

const categories = [
  { key: 'securityScore',   label: 'Security',   icon: Shield,  weight: '40%', color: '#ef4444' },
  { key: 'bugScore',        label: 'Bugs',        icon: Bug,     weight: '30%', color: '#f97316' },
  { key: 'complexityScore', label: 'Complexity',  icon: Zap,     weight: '20%', color: '#6366f1' },
  { key: 'styleScore',      label: 'Style',       icon: Palette, weight: '10%', color: '#22c55e' },
]

function ScoreRing({ score, size = 80 }) {
  const grade = getScoreGrade(score)
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background ring */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="var(--bg-tertiary)" strokeWidth={6}
        />
        {/* Score ring */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={grade.color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      {/* Score text */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: size === 80 ? 18 : 13, fontWeight: 700, color: grade.color, lineHeight: 1 }}>
          {score}
        </span>
        <span style={{ fontSize: size === 80 ? 11 : 9, color: grade.color, fontWeight: 600 }}>
          {grade.grade}
        </span>
      </div>
    </div>
  )
}

function ScoreBar({ score, color }) {
  return (
    <div style={{
      height: 4, borderRadius: 2,
      background: 'var(--bg-tertiary)',
      overflow: 'hidden', marginTop: 6,
    }}>
      <div style={{
        height: '100%',
        width: `${score}%`,
        background: color,
        borderRadius: 2,
        transition: 'width 1s ease-out',
      }} />
    </div>
  )
}

export default function ScoreCard({ review }) {
  const grade = getScoreGrade(review.overallScore)

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: 20,
    }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
        Score Breakdown
      </h3>

      {/* ── Overall Score ──────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: 16, borderRadius: 8,
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border)',
        marginBottom: 16,
      }}>
        <ScoreRing score={review.overallScore} size={80} />
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Overall Score</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: grade.color }}>{grade.label}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            {review.totalIssues} issues found
          </div>
        </div>
      </div>

      {/* ── Category Scores ────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {categories.map(({ key, label, icon: Icon, weight, color }) => (
          <div key={key}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon size={14} color={color} />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({weight})</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color }}>
                {review[key] ?? '—'}
              </span>
            </div>
            {review[key] && <ScoreBar score={review[key]} color={color} />}
          </div>
        ))}
      </div>

      {/* ── Issue counts ───────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 8, marginTop: 16,
      }}>
        {[
          { label: 'Critical', count: review.criticalCount, color: 'var(--critical)' },
          { label: 'High',     count: review.highCount,     color: 'var(--high)' },
          { label: 'Medium',   count: review.mediumCount,   color: 'var(--medium)' },
          { label: 'Low',      count: review.lowCount,      color: 'var(--low)' },
        ].map(({ label, count, color }) => (
          <div key={label} style={{
            padding: '8px 10px', borderRadius: 7,
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color }}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}