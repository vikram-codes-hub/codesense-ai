import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { mockUser } from '../utils/mockData'
import { Zap, Eye, EyeOff, Github } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Auth() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })

  const isLogin = mode === 'login'

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return }
    if (!isLogin && !form.name) { toast.error('Please enter your name'); return }
    if (!isLogin && form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (!isLogin && form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return }

    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 800))
      login(mockUser, 'mock_token_123')
      toast.success(isLogin ? 'Welcome back!' : 'Account created!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(isLogin ? 'Invalid credentials' : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGitHub = () => {
    login(mockUser, 'mock_token_123')
    toast.success('Logged in with GitHub!')
    navigate('/dashboard')
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setForm({ name: '', email: '', password: '', confirmPassword: '' })
    setShowPassword(false)
    setShowConfirm(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>

      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: 'linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 420, animation: 'slideUp 0.4s ease-out' }}>

        {/* ── Logo ──────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 24px var(--accent-glow)',
          }}>
            <Zap size={26} color="white" fill="white" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            CodeSense AI
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            {isLogin ? 'Sign in to your account' : 'Create your free account'}
          </p>
        </div>

        {/* ── Toggle tabs ───────────────────────── */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: 4,
          marginBottom: 20,
        }}>
          {['login', 'register'].map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 7,
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                transition: 'all 0.2s',
                background: mode === m ? 'var(--accent)' : 'transparent',
                color: mode === m ? 'white' : 'var(--text-secondary)',
                boxShadow: mode === m ? '0 0 10px var(--accent-glow)' : 'none',
              }}
            >
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* ── Card ──────────────────────────────── */}
        <div className="card" style={{ padding: 24 }}>

          {/* GitHub */}
          <button
            onClick={handleGitHub}
            style={{
              width: '100%', padding: '10px 16px', borderRadius: 8,
              background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', fontSize: 14, fontWeight: 500,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8, marginBottom: 20, transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <Github size={18} />
            Continue with GitHub
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div className="divider" style={{ margin: 0, flex: 1 }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              or continue with email
            </span>
            <div className="divider" style={{ margin: 0, flex: 1 }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>

            {/* Name — only on register */}
            {!isLogin && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Full Name
                </label>
                <input
                  className="input" type="text" name="name"
                  placeholder="Vikram Singh"
                  value={form.name} onChange={handleChange}
                  autoComplete="name"
                />
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Email
              </label>
              <input
                className="input" type="email" name="email"
                placeholder="you@example.com"
                value={form.email} onChange={handleChange}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder={isLogin ? '••••••••' : 'Min 6 characters'}
                  value={form.password} onChange={handleChange}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  style={{ paddingRight: 40 }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password — only on register */}
            {!isLogin && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Re-enter password"
                    value={form.confirmPassword} onChange={handleChange}
                    autoComplete="new-password"
                    style={{
                      paddingRight: 40,
                      borderColor: form.confirmPassword
                        ? form.password === form.confirmPassword ? 'var(--grade-a)' : 'var(--critical)'
                        : undefined,
                    }}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.confirmPassword && (
                  <p style={{ fontSize: 11, marginTop: 4, color: form.password === form.confirmPassword ? 'var(--grade-a)' : 'var(--critical)' }}>
                    {form.password === form.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                width: '100%', padding: '10px 16px', fontSize: 14,
                marginTop: isLogin ? 6 : 0,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading
                ? (isLogin ? 'Signing in...' : 'Creating account...')
                : (isLogin ? 'Sign In' : 'Create Account')
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}