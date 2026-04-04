import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useReview } from '../hooks/useReview'
import { useSocket } from '../hooks/useSocket'
import ScoreCard  from '../components/review/ScoreCard'
import IssueList  from '../components/review/IssueList'
import FileViewer from '../components/review/FileViewer'
import LiveFeed   from '../components/review/LiveFeed'
import { ArrowLeft, GitPullRequest, ExternalLink } from 'lucide-react'

export default function ReviewDetail() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { fetchReview, fetchReviewFiles, liveUpdates, addLiveUpdate } = useReview()
  const { socket } = useSocket(id)

  const [review,     setReview]     = useState(null)
  const [files,      setFiles]      = useState([])
  const [issues,     setIssues]     = useState([])
  const [liveEvents, setLiveEvents] = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data      = await fetchReview(id)
        const filesData = await fetchReviewFiles(id)
        if (data) {
          setReview(data.review)
          setIssues(data.issues || [])
        }
        if (filesData) setFiles(filesData)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  // ── Socket live events ────────────────────────────────
  useEffect(() => {
    if (!socket) return

    const addEvent = (event, message) => {
      setLiveEvents(prev => [...prev, {
        id:      Date.now(),
        event,
        message,
        time:    new Date().toLocaleTimeString(),
      }])
    }

    socket.on('review:started',   (d) => addEvent('review:started',   `Analysis started — ${d.totalFiles} file(s)`))
    socket.on('review:file:done', (d) => addEvent('review:file:done', `${d.filename} — Score: ${d.fileScore} — ${d.issuesFound} issues`))
    socket.on('review:complete',  (d) => {
      addEvent('review:complete', `Complete — Score: ${d.overallScore}/100`)
      // Reload review data
      fetchReview(id).then(data => {
        if (data) { setReview(data.review); setIssues(data.issues || []) }
      })
      fetchReviewFiles(id).then(f => { if (f) setFiles(f) })
    })
    socket.on('review:failed', (d) => addEvent('review:failed', `Failed: ${d.error}`))
    socket.on('review:posted', (d) => addEvent('review:posted', `GitHub comments posted — ${d.postedCount} comments`))

    return () => {
      socket.off('review:started')
      socket.off('review:file:done')
      socket.off('review:complete')
      socket.off('review:failed')
      socket.off('review:posted')
    }
  }, [socket, id])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
      <div className="spinner" />
    </div>
  )

  if (!review) return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
      Review not found
    </div>
  )

  const statusClass = {
    completed: 'badge-completed',
    running:   'badge-processing',
    pending:   'badge-pending',
    failed:    'badge-failed',
  }[review.status] || 'badge-pending'

  const repoName = review.repoId?.repoName || '—'

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
                {review.prTitle || 'Manual Review'}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{repoName}</span>
                {review.prNumber && (
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>#{review.prNumber}</span>
                )}
                <span className={statusClass} style={{ fontSize: 11 }}>{review.status}</span>
              </div>
            </div>
          </div>

          {review.prUrl && (
            <a
              href={review.prUrl}
              target="_blank" rel="noreferrer"
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

        {/* ── Left ─────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ height: 500 }}>
            <FileViewer files={files} issues={issues} />
          </div>
          <div style={{ height: 500 }}>
           <IssueList issues={issues} reviewId={id} />
          </div>
        </div>

        {/* ── Right ────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 0 }}>
          <ScoreCard review={review} />
          <LiveFeed events={liveEvents} />
        </div>
      </div>
    </div>
  )
}