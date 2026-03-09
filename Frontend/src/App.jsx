import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext'

import Login        from './pages/Login'
import Register     from './pages/Register'
import Dashboard    from './pages/Dashboard'
import Repositories from './pages/Repositories'
import ReviewDetail from './pages/ReviewDetail'
import ManualReview from './pages/ManualReview'
import Settings     from './pages/Settings'
import Layout       from './components/common/Layout'
import PageLoader   from './components/common/PageLoader'

// ── Protected Route ────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

// ── Public Route (redirect if logged in) ──────────────
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <PageLoader />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#161b22',
            color: '#e6edf3',
            border: '1px solid #30363d',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#161b22' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#161b22' } },
        }}
      />

      <Routes>
        {/* ── Public ──────────────────────────── */}
        <Route path="/login" element={
          <PublicRoute><Login /></PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute><Register /></PublicRoute>
        } />

        {/* ── Protected ───────────────────────── */}
        <Route path="/" element={
          <ProtectedRoute><Layout /></ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"           element={<Dashboard />} />
          <Route path="repositories"        element={<Repositories />} />
          <Route path="reviews/:id"         element={<ReviewDetail />} />
          <Route path="reviews/manual"      element={<ManualReview />} />
          <Route path="settings"            element={<Settings />} />
        </Route>

        {/* ── 404 ─────────────────────────────── */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}