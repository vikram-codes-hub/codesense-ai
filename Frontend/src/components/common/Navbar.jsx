import { useLocation } from 'react-router-dom'
import { useAuth }   from '../../context/AuthContext'
import { useLayout } from '../../context/AuthContext'
import { Bell, Search, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const pageTitles = {
  '/dashboard':      { title: 'Dashboard',     subtitle: 'Overview of your code quality' },
  '/repositories':   { title: 'Repositories',  subtitle: 'Manage connected GitHub repos' },
  '/reviews/manual': { title: 'Manual Review', subtitle: 'Paste code and analyze instantly' },
  '/settings':       { title: 'Settings',       subtitle: 'Manage your account and preferences' },
}

export default function Navbar() {
  const { pathname }                              = useLocation()
  const { user }                                  = useAuth()
  const { sidebarOpen, setSidebarOpen, isNarrow } = useLayout()
  const [hasNotif, setHasNotif]                   = useState(true)

  const current = Object.entries(pageTitles).find(([path]) =>
    pathname === path || pathname.startsWith(path)
  )
  const { title, subtitle } = current?.[1] || { title: 'CodeSense AI', subtitle: '' }

  const avatarSrc = user?.avatar ||
    `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=6366f1&color=fff`

  const iconBtn = {
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '6px 8px',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  }

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
      position: 'relative',
      zIndex: 40,
    }}>

      {/* ── Left: Hamburger (mobile) + Page Title ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Hamburger — only on mobile, toggles the sidebar */}
        {isNarrow && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarOpen(v => !v)}
            aria-label="Toggle sidebar"
            style={{
              ...iconBtn,
              borderColor: sidebarOpen ? 'var(--accent)' : 'var(--border)',
              color:        sidebarOpen ? 'var(--accent)' : 'var(--text-secondary)',
              transition: 'border-color 0.2s, color 0.2s',
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {sidebarOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0,   opacity: 1 }}
                  exit={{    rotate: 90,  opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ display: 'flex' }}
                >
                  <X size={16} />
                </motion.span>
              ) : (
                <motion.span
                  key="open"
                  initial={{ rotate: 90,  opacity: 0 }}
                  animate={{ rotate: 0,   opacity: 1 }}
                  exit={{    rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ display: 'flex' }}
                >
                  <Menu size={16} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )}

        {/* Page title */}
        <motion.div
          key={title}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <h1 style={{
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--text-primary)',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
          }}>
            {title}
          </h1>
          {subtitle && !isNarrow && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
              {subtitle}
            </p>
          )}
        </motion.div>
      </div>

      {/* ── Right: controls ─────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

        {/* Search — hide on mobile to save space */}
        {!isNarrow && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
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
          </motion.div>
        )}

        {/* Notifications bell */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={iconBtn}
        >
          <Bell size={16} />
          {hasNotif && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                position: 'absolute',
                top: 6, right: 6,
                width: 6, height: 6,
                borderRadius: '50%',
                background: 'var(--accent)',
              }}
            />
          )}
        </motion.button>

        {/* Avatar */}
        <motion.img
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          src={avatarSrc}
          alt="avatar"
          style={{
            width: isNarrow ? 30 : 32,
            height: isNarrow ? 30 : 32,
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