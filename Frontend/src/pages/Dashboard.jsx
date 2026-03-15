import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/axios'
import StatsWidget   from '../components/dashboard/StatsWidget'
import ActivityChart from '../components/dashboard/ActivityChart'
import RecentReviews from '../components/dashboard/RecentReviews'
import RepoCard      from '../components/dashboard/RepoCard'
import {
  GitPullRequest, AlertTriangle,
  Shield, BarChart2, GitBranch,
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()

  const [stats,   setStats]   = useState(null)
  const [recent,  setRecent]  = useState([])
  const [repos,   setRepos]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, recentRes, reposRes] = await Promise.all([
          api.get('/api/dashboard/stats'),
          api.get('/api/dashboard/recent'),
          api.get('/api/repos'),
        ])
        setStats(statsRes.data.data.stats)
        setRecent(recentRes.data.data.reviews)
        setRepos(reposRes.data.data.repos)
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div className="spinner" />
    </div>
  )

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>

      {/* ── Header ──────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          Good morning, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Here's what's happening with your code quality today.
        </p>
      </div>

      {/* ── Stats Grid ──────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16, marginBottom: 24,
      }}>
        <StatsWidget
          title="Total Reviews"
          value={stats?.totalReviews ?? 0}
          subtitle={`${stats?.completedReviews ?? 0} completed`}
          icon={GitPullRequest}
          iconColor="#6366f1"
        />
        <StatsWidget
          title="Average Score"
          value={stats?.avgScore ?? '—'}
          subtitle="Across all repos"
          icon={BarChart2}
          iconColor="#22c55e"
        />
        <StatsWidget
          title="Total Issues"
          value={stats?.totalIssues ?? 0}
          subtitle="All time"
          icon={AlertTriangle}
          iconColor="#eab308"
        />
        <StatsWidget
          title="Critical Issues"
          value={stats?.criticalIssues ?? 0}
          subtitle="Needs attention"
          icon={Shield}
          iconColor="#ef4444"
        />
      </div>

      {/* ── Main Grid ───────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: 16, marginBottom: 24,
      }}>
        <ActivityChart />
        <RecentReviews reviews={recent} />
      </div>

      {/* ── Connected Repos ─────────────────────────── */}
      <div>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <GitBranch size={16} color="var(--text-secondary)" />
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
              Connected Repositories
            </span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {repos.length} connected
          </span>
        </div>

        {repos.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '40px 0',
            color: 'var(--text-muted)', fontSize: 14,
          }}>
            <GitBranch size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>No repositories connected yet</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 14,
          }}>
            {repos.map(repo => (
              <RepoCard key={repo._id} repo={repo} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}