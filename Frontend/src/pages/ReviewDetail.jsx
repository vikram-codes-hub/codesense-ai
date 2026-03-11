import { useParams, useNavigate } from 'react-router-dom'
import { mockReviews, mockReviewFiles, mockIssues, mockLiveFeed } from '../utils/mockData'
import ScoreCard  from '../components/review/ScoreCard'
import IssueList  from '../components/review/IssueList'
import FileViewer from '../components/review/FileViewer'
import LiveFeed   from '../components/review/LiveFeed'
import { ArrowLeft, GitPullRequest, ExternalLink } from 'lucide-react'

export default function ReviewDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Use mock data — swap with API later
  const review = mockReviews.find(r => r._id === id) || mockReviews[0]
  const files   = mockReviewFiles.filter(f => f.reviewId === review._id)
  const issues  = mockIssues.filter(i => i.reviewId === review._id)

  const statusClass = {
    completed:  'badge-completed',
    processing: 'badge-processing',
    pending:    'badge-pending',
    failed:     'badge-failed',
  }[review.status]

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>

      {/* ── Header ──────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'transparent', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, marginBottom: 12, padding: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ArrowLeft size={15} /> Back
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <GitPullRequest size={18} color="var(--accent)" />
            </div>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {review.prTitle}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {review.repoName}
                </span>
                {review.prNumber && (
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    #{review.prNumber}
                  </span>
                )}
                <span className={statusClass} style={{ fontSize: 11 }}>
                  {review.status}
                </span>
              </div>
            </div>
          </div>

          {review.prUrl && (
            
              <a href={review.prUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 8,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontSize: 13, textDecoration: 'none',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              <ExternalLink size={14} /> View PR
            </a>
          )}
        </div>
      </div>

      {/* ── Main Layout ─────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>

        {/* ── Left Column ─────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* File Viewer */}
          <div style={{ height: 500 }}>
            <FileViewer files={files.length ? files : mockReviewFiles} issues={issues} />
          </div>

          {/* Issue List */}
          <div style={{ height: 500 }}>
            <IssueList issues={issues.length ? issues : mockIssues} />
          </div>
        </div>

        {/* ── Right Column ────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 0 }}>
          <ScoreCard review={review} />
          <LiveFeed events={mockLiveFeed} />
        </div>
      </div>
    </div>
  )
}