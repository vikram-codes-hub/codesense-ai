import { useNavigate } from 'react-router-dom'
import { GitPullRequest, ChevronRight } from 'lucide-react'

const getScoreGrade = (score) => {
  if (score >= 90) return { color: '#22c55e' }
  if (score >= 75) return { color: '#84cc16' }
  if (score >= 60) return { color: '#eab308' }
  if (score >= 40) return { color: '#f97316' }
  return { color: '#ef4444' }
}

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function RecentReviews({ reviews = [] }) {
  const navigate = useNavigate()

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Recent Reviews</div>
        <button
          onClick={() => navigate('/repositories')}
          style={{ fontSize: 12, color: 'var(--accent)', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          View all
        </button>
      </div>

      {reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>
          No reviews yet
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {reviews.map((review) => {
            const grade = review.overallScore ? getScoreGrade(review.overallScore) : null
            const repoName = review.repoId?.repoName || '—'

            return (
              <div
                key={review._id}
                onClick={() => navigate(`/reviews/${review._id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 8,
                  background: 'var(--bg-tertiary)',
                  border: '1px solid transparent',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: 'var(--bg-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <GitPullRequest size={15} color="var(--text-muted)" />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 500, color: 'var(--text-primary)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {review.prTitle || 'Manual Review'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {repoName} · {formatDate(review.createdAt)}
                  </div>
                </div>

                {grade && (
                  <div style={{
                    fontSize: 14, fontWeight: 700, color: grade.color,
                    fontFamily: 'JetBrains Mono, monospace', flexShrink: 0,
                  }}>
                    {review.overallScore}
                  </div>
                )}

                <span className={`badge-${review.status}`} style={{ flexShrink: 0 }}>
                  {review.status}
                </span>

                <ChevronRight size={14} color="var(--text-muted)" />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}