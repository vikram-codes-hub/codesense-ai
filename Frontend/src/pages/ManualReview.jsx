import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockReviews, mockReviewFiles, mockIssues } from '../utils/mockData'
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

const MOCK_LIVE_EVENTS = [
  { id: 1, event: 'review:queued',    message: 'Manual review queued',              time: '00:00:01' },
  { id: 2, event: 'review:started',   message: 'Analysis started — 1 file',         time: '00:00:02' },
  { id: 3, event: 'review:file:done', message: 'code.js — Score: 42 — 5 issues',    time: '00:00:04' },
  { id: 4, event: 'review:complete',  message: 'Complete — Overall Score: 42',       time: '00:00:05' },
]

export default function ManualReview() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [loading, setLoading] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [liveEvents, setLiveEvents] = useState([])

  const handleAnalyze = async () => {
    if (!code.trim()) { toast.error('Please paste some code first'); return }
    setLoading(true)
    setAnalyzed(false)
    setLiveEvents([])

    // Simulate live feed events one by one
    for (let i = 0; i < MOCK_LIVE_EVENTS.length; i++) {
      await new Promise(r => setTimeout(r, 800))
      setLiveEvents(prev => [...prev, MOCK_LIVE_EVENTS[i]])
    }

    setLoading(false)
    setAnalyzed(true)
    toast.success('Analysis complete!')
  }

  const handleReset = () => {
    setCode('')
    setAnalyzed(false)
    setLiveEvents([])
  }

  const mockReview = mockReviews[1] // use a review with low score for demo

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
                  <button onClick={handleReset} className="btn-secondary" style={{ padding: '5px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
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
          {analyzed && (
            <div style={{ height: 400, animation: 'slideUp 0.3s ease-out' }}>
              <IssueList issues={mockIssues} />
            </div>
          )}
        </div>

        {/* ── Right ───────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 0 }}>

          {/* Live Feed — always visible */}
          <LiveFeed events={liveEvents} />

          {/* Score — shown after analysis */}
          {analyzed && (
            <div style={{ animation: 'slideUp 0.3s ease-out' }}>
              <ScoreCard review={mockReview} />
            </div>
          )}

          {/* Placeholder before analysis */}
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