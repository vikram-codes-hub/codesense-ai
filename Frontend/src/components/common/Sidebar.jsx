import { NavLink, useLocation } from 'react-router-dom'
import { useAuth }   from '../../context/AuthContext'
import { useLayout } from '../../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, GitBranch, FileCode,
  Settings, Zap, LogOut, ChevronRight, X,
} from 'lucide-react'

const navItems = [
  { path: '/dashboard',      label: 'Dashboard',     icon: LayoutDashboard },
  { path: '/repositories',   label: 'Repositories',  icon: GitBranch },
  { path: '/reviews/manual', label: 'Manual Review', icon: FileCode },
  { path: '/settings',       label: 'Settings',       icon: Settings },
]

/* ── Variants ───────────────────────────────────────── */
const sidebarVariants = {
  open:   { x: 0,      transition: { type: 'spring', stiffness: 300, damping: 30 } },
  closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
}

const itemVariants = {
  open:   (i) => ({ opacity: 1, x: 0,   transition: { delay: i * 0.045, duration: 0.22 } }),
  closed: {        opacity: 0, x: -10 },
}

export default function Sidebar() {
  const { logout, user }                          = useAuth()
  const { sidebarOpen, setSidebarOpen, isNarrow } = useLayout()
  const location = useLocation()

  /* Close on nav tap (mobile) */
  const handleNav = () => { if (isNarrow) setSidebarOpen(false) }

  return (
    <>
      {/* ── Sidebar panel ───────────────────────────── */}
      <motion.div
        variants={sidebarVariants}
        initial={false}
        animate={sidebarOpen ? 'open' : 'closed'}
        style={{
          width: 240,
          height: '100vh',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          /* Mobile: fixed overlay; Desktop: normal flow */
          ...(isNarrow ? {
            position: 'fixed',
            top: 0, left: 0,
            zIndex: 60,
            boxShadow: '6px 0 32px rgba(0,0,0,0.5)',
          } : {
            position: 'relative',
          }),
        }}
      >

        {/* ── Logo ──────────────────────────────────── */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          {/* Icon */}
          <div style={{
            width: 32, height: 32,
            borderRadius: 8,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px var(--accent-glow)',
            flexShrink: 0,
          }}>
            <Zap size={18} color="white" fill="white" />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              CodeSense
            </div>
            <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 500 }}>AI</div>
          </div>

          {/* Close button — only on mobile */}
          {isNarrow && (
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: 4,
                cursor: 'pointer',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
                transition: 'color 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--text-primary)'
                e.currentTarget.style.borderColor = 'var(--text-muted)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--text-muted)'
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              <X size={15} />
            </motion.button>
          )}
        </div>

        {/* ── Nav Items ─────────────────────────────── */}
        <nav style={{
          flex: 1,
          padding: '12px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflowY: 'auto',
        }}>
          {navItems.map(({ path, label, icon: Icon }, i) => {
            const isActive =
              location.pathname === path ||
              (path !== '/dashboard' && location.pathname.startsWith(path))

            return (
              <motion.div
                key={path}
                custom={i}
                variants={itemVariants}
                initial="closed"
                animate={sidebarOpen ? 'open' : 'closed'}
              >
                <NavLink
                  to={path}
                  onClick={handleNav}
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
                      e.currentTarget.style.color      = 'var(--text-primary)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color      = 'var(--text-secondary)'
                    }
                  }}
                >
                  <Icon size={17} />
                  <span style={{ flex: 1 }}>{label}</span>
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight size={14} style={{ color: 'var(--accent)' }} />
                    </motion.span>
                  )}
                </NavLink>
              </motion.div>
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
            style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
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
              flexShrink: 0,
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--critical)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <LogOut size={16} />
          </motion.button>
        </div>
      </motion.div>

      {/* ── Backdrop (mobile only) ───────────────────── */}
      <AnimatePresence>
        {isNarrow && sidebarOpen && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(3px)',
              zIndex: 50,           // behind sidebar (60) but above content
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}