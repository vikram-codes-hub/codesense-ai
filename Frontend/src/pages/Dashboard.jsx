import { useAuth } from '../context/AuthContext'
import {
  mockDashboardStats,
  mockRepos,
} from '../utils/mockData'
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
  const stats = mockDashboardStats

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
          value={stats.totalReviews}
          subtitle={`${stats.reviewsThisWeek} this week`}
          icon={GitPullRequest}
          iconColor="#6366f1"
          change={stats.reviewsThisWeek}
        />
        <StatsWidget
          title="Average Score"
          value={`${stats.avgScore}`}
          subtitle="Across all repos"
          icon={BarChart2}
          iconColor="#22c55e"
          change={stats.scoreChange}
        />
        <StatsWidget
          title="Total Issues"
          value={stats.totalIssues}
          subtitle="All time"
          icon={AlertTriangle}
          iconColor="#eab308"
          change={stats.issuesChange}
        />
        <StatsWidget
          title="Critical Issues"
          value={stats.criticalIssues}
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
        <RecentReviews />
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
            {mockRepos.filter(r => r.isConnected).length} connected
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 14,
        }}>
          {mockRepos.map(repo => (
            <RepoCard key={repo._id} repo={repo} />
          ))}
        </div>
      </div>
    </div>
  )
}