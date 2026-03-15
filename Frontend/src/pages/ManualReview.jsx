import { useState } from 'react'
import { useReview }  from '../hooks/useReview'
import { useSocket }  from '../hooks/useSocket'
import ScoreCard from '../components/review/ScoreCard'
import IssueList from '../components/review/IssueList'
import LiveFeed  from '../components/review/LiveFeed'
import { FileCode, Play, RotateCcw, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

const languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python',     label: 'Python' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java',       label: 'Java' },
  { value: 'cpp',        label: 'C++' },
]

const SAMPLE_CODE = `// Paste your code here and click Analyze
function processUserData(req, res) {
  const userId = req.query.id;
  const query = "SELECT * FROM users WHERE id = " + userId;
  
  const password = "admin123"; // hardcoded secret
  
  try {
    db.query(query, (err, result) => {
      if (err) throw err;
      res.json(result);
    });
  } catch(e) {
    console.log(e);
  }
}`

export default function ManualReview() {
  const { submitManualReview, liveUpdates, currentReview } = useReview()
  const { socket } = useSocket()

  const [code,      setCode]      = useState('')
  const [language,  setLanguage]  = useState('javascript')
  const [loading,   setLoading]   = useState(false)
  const [analyzed,  setAnalyzed]  = useState(false)
  const [reviewId,  setReviewId]  = useState(null)
  const [result,    setResult]    = useState(null)
  const [issues,    setIssues]    = useState([])
  const [liveEvents, setLiveEvents] = useState([])

  // ── Listen to socket events for this review ───────────
  const addEvent = (event, message) => {
    setLiveEvents(prev => [...prev, {
      id:      Date.now(),
      event,
      message,
      time:    new Date().toLocaleTimeString(),
    }])
  }

  const handleAnalyze = async () => {
    if (!code.trim()) { toast.error('Please paste some code first'); return }

    setLoading(true)
    setAnalyzed(false)
    setLiveEvents([])
    setResult(null)
    setIssues([])

    try {
      addEvent('review:queued', 'Manual review queued')

      const data = await submitManualReview(
        code,
        language,
        `code.${language === 'python' ? 'py' : language === 'typescript' ? 'ts' : 'js'}`
      )

      setReviewId(data.reviewId)
      addEvent('review:started', 'Analysis started — 1 file')

      // ── Poll for completion via socket ────────────────
      if (socket) {
        socket.emit('subscribe:review', { reviewId: data.reviewId })

        socket.once('review:file:done', (d) => {
          addEvent('review:file:done', `File analyzed — Score: ${d.fileScore} — ${d.issuesFound} issues`)
        })

        socket.once('review:complete', async (d) => {
          addEvent('review:complete', `Complete — Score: ${d.overallScore}/100 | ${d.totalIssues} issues`)
          setResult(d)
          setAnalyzed(true)
          setLoading(false)
          toast.success('Analysis complete!')

          // Fetch full review details
          try {
            const { default: api } = await import('../utils/axios')
            const [reviewRes, filesRes] = await Promise.all([
              api.get(`/api/reviews/${d.reviewId}`),
              api.get(`/api/reviews/${d.reviewId}/files`),
            ])
            setResult(reviewRes.data.data.review)
            setIssues(reviewRes.data.data.issues || [])
          } catch (e) {
            console.error('Failed to fetch review details:', e)
          }
        })

        socket.once('review:failed', (d) => {
          addEvent('review:failed', `Failed: ${d.error}`)
          toast.error('Analysis failed')
          setLoading(false)
        })
      }

    } catch (err) {
      setLoading(false)
      // error handled in hook
    }
  }

  const handleReset = () => {
    setCode('')
    setAnalyzed(false)
    setLiveEvents([])
    setResult(null)
    setIssues([])
    setReviewId(null)
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>

      {/* ── Header ──────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          Manual Review
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Paste your code below and get instant AI-powered analysis
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>

        {/* ── Left ────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Code Input */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            overflow: 'hidden',
          }}>
            {/* Toolbar */}
            <div style={{
              padding: '10px 14px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--bg-primary)',
            }}>
              <FileCode size={15} color="var(--accent)" />
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, flex: 1 }}>
                Code Editor
              </span>

              {/* Language selector */}
              <div style={{ position: 'relative' }}>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  style={{
                    padding: '5px 28px 5px 10px',
                    borderRadius: 6,
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    fontSize: 12,
                    cursor: 'pointer',
                    appearance: 'none',
                    outline: 'none',
                  }}
                >
                  {languages.map(l => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
                <ChevronDown size={12} style={{
                  position: 'absolute', right: 8, top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', pointerEvents: 'none',
                }} />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6 }}>
                {analyzed && (
                  <button onClick={handleReset} className="btn-secondary"
                    style={{ padding: '5px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <RotateCcw size={12} /> Reset
                  </button>
                )}
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="btn-primary"
                  style={{
                    padding: '5px 14px', fontSize: 12,
                    display: 'flex', alignItems: 'center', gap: 5,
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Play size={12} />
                  {loading ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
            </div>

            {/* Textarea */}
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder={SAMPLE_CODE}
              spellCheck={false}
              style={{
                width: '100%',
                minHeight: 400,
                padding: 16,
                background: 'var(--bg-primary)',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: 13,
                fontFamily: 'JetBrains Mono, monospace',
                lineHeight: 1.6,
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />

            {/* Footer */}
            <div style={{
              padding: '6px 14px',
              borderTop: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                {code.split('\n').length} lines · {code.length} chars
              </span>
              <span style={{ fontSize: 11, color: 'var(--accent)' }}>
                {languages.find(l => l.value === language)?.label}
              </span>
            </div>
          </div>

          {/* Issues — shown after analysis */}
          {analyzed && issues.length > 0 && (
            <div style={{ animation: 'slideUp 0.3s ease-out' }}>
              <IssueList issues={issues} />
            </div>
          )}
        </div>

        {/* ── Right ───────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 0 }}>

          <LiveFeed events={liveEvents} />

          {analyzed && result && (
            <div style={{ animation: 'slideUp 0.3s ease-out' }}>
              <ScoreCard review={result} />
            </div>
          )}

          {!analyzed && !loading && (
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: 24,
              textAlign: 'center',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
              }}>
                <Play size={20} color="var(--accent)" />
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Ready to analyze
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Paste code and click Analyze
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}