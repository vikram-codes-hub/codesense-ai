import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Bell, Search } from 'lucide-react'

const pageTitles = {
  '/dashboard':       { title: 'Dashboard',      subtitle: 'Overview of your code quality' },
  '/repositories':    { title: 'Repositories',   subtitle: 'Manage connected GitHub repos' },
  '/reviews/manual':  { title: 'Manual Review',  subtitle: 'Paste code and analyze instantly' },
  '/settings':        { title: 'Settings',        subtitle: 'Manage your account and preferences' },
}

export default function Navbar() {
  const { pathname } = useLocation()
  const { user } = useAuth()

  const current = Object.entries(pageTitles).find(([path]) =>
    pathname === path || pathname.startsWith(path)
  )
  const { title, subtitle } = current?.[1] || { title: 'CodeSense AI', subtitle: '' }

  return (
    <div style={{
      height: 60,
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
    }}>

      {/* ── Page Title ────────────────────────────── */}
      <div>
        <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* ── Right Side ────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          cursor: 'pointer',
        }}>
          <Search size={14} color="var(--text-muted)" />
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Search...</span>
          <kbd style={{
            fontSize: 10,
            color: 'var(--text-muted)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '1px 5px',
          }}>⌘K</kbd>
        </div>

        {/* Notifications */}
        <button style={{
          background: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '6px 8px',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
        }}>
          <Bell size={16} />
          {/* Notification dot */}
          <span style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--accent)',
          }} />
        </button>

        {/* Avatar */}
        <img
          src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`}
          alt="avatar"
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid var(--border)',
            cursor: 'pointer',
          }}
        />
      </div>
    </div>
  )
}