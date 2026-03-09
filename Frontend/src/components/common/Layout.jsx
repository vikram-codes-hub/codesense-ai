import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar  from './Navbar'

export default function Layout() {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--bg-primary)',
    }}>
      {/* ── Sidebar ───────────────────────── */}
      <Sidebar />

      {/* ── Main ─────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
  )
}