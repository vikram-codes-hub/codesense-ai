import { useNavigate } from 'react-router-dom'
import { GitBranch, Star } from 'lucide-react'
import { getScoreGrade, formatDate } from '../../utils/mockData'

export default function RepoCard({ repo }) {
  const navigate = useNavigate()
  const grade = repo.avgScore ? getScoreGrade(repo.avgScore) : null

  return (
    <div
      className="card-hover"
      onClick={() => navigate('/repositories')}
      style={{ padding: 16, cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--bg-tertiary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GitBranch size={15} color="var(--accent)" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              {repo.repoName}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {repo.language}
            </div>
          </div>
        </div>

        {/* Score ring */}
        {grade && (
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            border: `2px solid ${grade.color}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: grade.color,
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            {repo.avgScore}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Last review: {repo.lastReviewAt ? formatDate(repo.lastReviewAt) : 'Never'}
        </span>
        <span className={repo.isConnected ? 'badge-completed' : 'badge-failed'}>
          {repo.isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </div>
  )
}