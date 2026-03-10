import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard,
  GitBranch,
  FileCode,
  Settings,
  Zap,
  LogOut,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { path: '/dashboard',    label: 'Dashboard',     icon: LayoutDashboard },
  { path: '/repositories', label: 'Repositories',  icon: GitBranch },
  { path: '/reviews/manual', label: 'Manual Review', icon: FileCode },
  { path: '/settings',    label: 'Settings',       icon: Settings },
]

export default function Sidebar() {
  const { logout, user } = useAuth()
  const location = useLocation()

  return (
    <div style={{
      width: 240,
      height: '100vh',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>

      {/* ── Logo ──────────────────────────────────── */}
      <div style={{
        padding: '20px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 12px var(--accent-glow)',
        }}>
          <Zap size={18} color="white" fill="white" />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            CodeSense
          </div>
          <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 500 }}>
            AI
          </div>
        </div>
      </div>

      {/* ── Nav Items ─────────────────────────────── */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path ||
            (path !== '/dashboard' && location.pathname.startsWith(path))

          return (
            <NavLink
              key={path}
              to={path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--bg-tertiary)' : 'transparent',
                borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-tertiary)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }
              }}
            >
              <Icon size={17} />
              <span style={{ flex: 1 }}>{label}</span>
              {isActive && <ChevronRight size={14} style={{ color: 'var(--accent)' }} />}
            </NavLink>
          )
        })}
      </nav>

      {/* ── Plan Badge ────────────────────────────── */}
      <div style={{ padding: '0 10px 12px' }}>
        <div style={{
          padding: '10px 12px',
          borderRadius: 8,
          background: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.2)',
        }}>
          <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginBottom: 2 }}>
            {user?.plan === 'pro' ? '⚡ Pro Plan' : '🆓 Free Plan'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {user?.totalReviews || 0} reviews completed
          </div>
        </div>
      </div>

      {/* ── User + Logout ─────────────────────────── */}
      <div style={{
        padding: '12px 10px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <img
          src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`}
          alt="avatar"
          style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.email}
          </div>
        </div>
        <button
          onClick={logout}
          title="Logout"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            padding: 4,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--critical)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  )
}