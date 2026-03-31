import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar  from './Navbar'
import { LayoutProvider } from '../../context/AuthContext'

export default function Layout() {
  return (
    <LayoutProvider>
      <div style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg-primary)',
      }}>
        {/* Sidebar handles its own positioning */}
        <Sidebar />

        {/* ── Main ─────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <Navbar />
          <main style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
          }}>
            <Outlet />
          </main>
        </div>
      </div>
    </LayoutProvider>
  )
}