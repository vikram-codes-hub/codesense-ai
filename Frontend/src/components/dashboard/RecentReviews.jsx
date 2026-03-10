import { useNavigate } from 'react-router-dom'
import { mockRecentReviews, getScoreGrade, formatDate } from '../../utils/mockData'
import { GitPullRequest, ChevronRight } from 'lucide-react'

export default function RecentReviews() {
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {mockRecentReviews.map((review) => {
          const grade = review.overallScore ? getScoreGrade(review.overallScore) : null

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
              {/* Icon */}
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: 'var(--bg-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <GitPullRequest size={15} color="var(--text-muted)" />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 500, color: 'var(--text-primary)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {review.prTitle}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {review.repoName} · {formatDate(review.createdAt)}
                </div>
              </div>

              {/* Score */}
              {grade && (
                <div style={{
                  fontSize: 14, fontWeight: 700, color: grade.color,
                  fontFamily: 'JetBrains Mono, monospace', flexShrink: 0,
                }}>
                  {review.overallScore}
                </div>
              )}

              {/* Status badge */}
              <span className={`badge-${review.status}`} style={{ flexShrink: 0 }}>
                {review.status}
              </span>

              <ChevronRight size={14} color="var(--text-muted)" />
            </div>
          )
        })}
      </div>
    </div>
  )
}