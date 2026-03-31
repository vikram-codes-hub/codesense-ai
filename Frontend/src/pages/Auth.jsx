import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Zap, Eye, EyeOff, Github, ArrowRight, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'

/* ─── Three.js Neural Background ─────────────────────────────── */
function NeuralBackground() {
  const mountRef = useRef(null)

  useEffect(() => {
    const el = mountRef.current
    const W = window.innerWidth, H = window.innerHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000)
    camera.position.z = 80

    /* ── Particles ── */
    const COUNT = 220
    const positions = new Float32Array(COUNT * 3)
    const pts = []
    for (let i = 0; i < COUNT; i++) {
      const x = (Math.random() - 0.5) * 200
      const y = (Math.random() - 0.5) * 200
      const z = (Math.random() - 0.5) * 60
      positions[i * 3]     = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
      pts.push(new THREE.Vector3(x, y, z))
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const mat = new THREE.PointsMaterial({ color: 0x6366f1, size: 0.7, transparent: true, opacity: 0.7 })
    const mesh = new THREE.Points(geo, mat)
    scene.add(mesh)

    /* ── Connections ── */
    const linePositions = []
    const THRESHOLD = 28
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        if (pts[i].distanceTo(pts[j]) < THRESHOLD) {
          linePositions.push(pts[i].x, pts[i].y, pts[i].z)
          linePositions.push(pts[j].x, pts[j].y, pts[j].z)
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry()
    lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3))
    const lineMat = new THREE.LineBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.09 })
    const lines = new THREE.LineSegments(lineGeo, lineMat)
    scene.add(lines)

    /* ── Animate ── */
    let frame
    const clock = new THREE.Clock()
    const animate = () => {
      frame = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      mesh.rotation.y = t * 0.04
      mesh.rotation.x = t * 0.015
      lines.rotation.y = t * 0.04
      lines.rotation.x = t * 0.015
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  )
}

/* ─── Floating Input ──────────────────────────────────────────── */
function FloatInput({ label, type = 'text', name, placeholder, value, onChange, autoComplete, rightEl, style = {} }) {
  const [focused, setFocused] = useState(false)
  const active = focused || value

  return (
    <motion.div
      style={{ position: 'relative', marginBottom: 18 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <label style={{
        position:   'absolute',
        left:       13,
        top:        active ? -9 : 12,
        fontSize:   active ? 11 : 14,
        fontWeight: 500,
        color:      focused ? '#818cf8' : active ? '#8b949e' : '#484f58',
        background: active ? '#0d1117' : 'transparent',
        padding:    active ? '0 4px' : 0,
        borderRadius: 3,
        transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
        pointerEvents: 'none',
        zIndex: 1,
        letterSpacing: '0.02em',
      }}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        placeholder={focused ? placeholder : ''}
        style={{
          width: '100%',
          padding: '13px 14px',
          paddingRight: rightEl ? 42 : 14,
          borderRadius: 10,
          fontSize: 14,
          background: 'rgba(22, 27, 34, 0.8)',
          backdropFilter: 'blur(8px)',
          border: `1.5px solid ${focused ? '#6366f1' : 'rgba(48,54,61,0.8)'}`,
          color: '#e6edf3',
          outline: 'none',
          transition: 'all 0.25s',
          boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.12), 0 0 20px rgba(99,102,241,0.08)' : 'none',
          fontFamily: 'Geist, Inter, sans-serif',
          ...style,
        }}
      />
      {rightEl && (
        <div style={{
          position: 'absolute', right: 12, top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex', alignItems: 'center',
        }}>{rightEl}</div>
      )}
    </motion.div>
  )
}

/* ─── Main Auth Component ─────────────────────────────────────── */
export default function Auth() {
  const { loginUser, registerUser, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [mode,         setMode]         = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [form,         setForm]         = useState({ name: '', email: '', password: '', confirmPassword: '' })

  const isLogin = mode === 'login'

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token  = params.get('token')
    const error  = params.get('error')
    if (token) { localStorage.setItem('token', token); window.location.href = '/dashboard' }
    if (error) toast.error('GitHub login failed. Please try again.')
  }, [])

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard')
  }, [isAuthenticated])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password)                               { toast.error('Please fill in all fields');              return }
    if (!isLogin && !form.name)                                      { toast.error('Please enter your name');                 return }
    if (!isLogin && form.password.length < 6)                       { toast.error('Password must be at least 6 characters'); return }
    if (!isLogin && form.password !== form.confirmPassword)         { toast.error('Passwords do not match');                 return }
    setLoading(true)
    try {
      if (isLogin) await loginUser(form.email, form.password)
      else         await registerUser(form.name, form.email, form.password)
    } catch (_) {}
    finally { setLoading(false) }
  }

  const handleGitHub = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/github`
  }

  const switchMode = (m) => {
    setMode(m)
    setForm({ name: '', email: '', password: '', confirmPassword: '' })
    setShowPassword(false); setShowConfirm(false)
  }

  const pwMatch = form.confirmPassword
    ? form.password === form.confirmPassword
    : null

  /* ── animation variants ── */
  const cardVariants = {
    hidden:  { opacity: 0, y: 40, scale: 0.96 },
    visible: { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  }
  const stagger = {
    visible: { transition: { staggerChildren: 0.07 } },
  }
  const item = {
    hidden:  { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  }

  return (
    <div style={{
      minHeight:      '100vh',
      background:     '#060810',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        24,
      fontFamily:     "'Inter', sans-serif",
      position:       'relative',
      overflow:       'hidden',
    }}>

      {/* Three.js */}
      <NeuralBackground />

      {/* Radial glow behind card */}
      <div style={{
        position:   'fixed',
        top: '50%', left: '50%',
        transform:  'translate(-50%, -50%)',
        width:  700, height: 700,
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <motion.div
        style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Logo ── */}
        <motion.div
          style={{ textAlign: 'center', marginBottom: 32 }}
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={item}>
            <motion.div
              style={{
                width: 58, height: 58, borderRadius: 16,
                background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 18px',
                boxShadow: '0 0 40px rgba(99,102,241,0.5), 0 0 80px rgba(99,102,241,0.2)',
              }}
              animate={{ boxShadow: [
                '0 0 40px rgba(99,102,241,0.4), 0 0 80px rgba(99,102,241,0.15)',
                '0 0 60px rgba(99,102,241,0.7), 0 0 100px rgba(99,102,241,0.3)',
                '0 0 40px rgba(99,102,241,0.4), 0 0 80px rgba(99,102,241,0.15)',
              ]}}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Zap size={28} color="white" fill="white" />
            </motion.div>
          </motion.div>

          <motion.h1 variants={item} style={{
            fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em',
            color: '#f0f6fc', marginBottom: 6,
          }}>
            CodeSense <span style={{ color: '#818cf8' }}>AI</span>
          </motion.h1>
          <motion.p variants={item} style={{ fontSize: 14, color: '#484f58', letterSpacing: '0.01em' }}>
            {isLogin ? 'Welcome back — sign in to continue' : 'Create your account and start building'}
          </motion.p>
        </motion.div>

        {/* ── Tab switcher ── */}
        <motion.div
          variants={item}
          initial="hidden"
          animate="visible"
          style={{
            display: 'flex',
            background: 'rgba(22,27,34,0.6)',
            border: '1px solid rgba(48,54,61,0.6)',
            borderRadius: 12,
            padding: 4,
            marginBottom: 16,
            backdropFilter: 'blur(12px)',
          }}
        >
          {['login', 'register'].map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              style={{
                flex: 1, padding: '9px 0', borderRadius: 9, border: 'none',
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
                letterSpacing: '0.02em',
                transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                background: mode === m
                  ? 'linear-gradient(135deg, #6366f1, #818cf8)'
                  : 'transparent',
                color: mode === m ? 'white' : '#484f58',
                boxShadow: mode === m ? '0 2px 16px rgba(99,102,241,0.4)' : 'none',
              }}
            >
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </motion.div>

        {/* ── Glass Card ── */}
        <motion.div
          style={{
            background:    'rgba(13, 17, 23, 0.75)',
            border:        '1px solid rgba(48, 54, 61, 0.6)',
            borderRadius:  16,
            padding:       28,
            backdropFilter:'blur(20px)',
            boxShadow:     '0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
          layout
        >
          {/* GitHub */}
          <motion.button
            whileHover={{ scale: 1.015, borderColor: '#6366f1' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGitHub}
            style={{
              width: '100%', padding: '11px 16px', borderRadius: 10,
              background: 'rgba(30, 36, 51, 0.8)',
              border: '1.5px solid rgba(48,54,61,0.8)',
              color: '#e6edf3', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 10, marginBottom: 22,
              letterSpacing: '0.01em',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
          >
            <Github size={18} />
            Continue with GitHub
          </motion.button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(48,54,61,0.6)' }} />
            <span style={{ fontSize: 11, color: '#30363d', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
              or email
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(48,54,61,0.6)' }} />
          </div>

          {/* Form fields */}
          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <form onSubmit={handleSubmit}>

                {!isLogin && (
                  <FloatInput
                    label="Full Name"
                    name="name"
                    placeholder="Vikram Singh"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="name"
                  />
                )}

                <FloatInput
                  label="Email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />

                <FloatInput
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder={isLogin ? '••••••••' : 'Min 6 characters'}
                  value={form.password}
                  onChange={handleChange}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  rightEl={
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#484f58', display: 'flex', padding: 0 }}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                />

                {!isLogin && (
                  <div style={{ marginBottom: 8 }}>
                    <FloatInput
                      label="Confirm Password"
                      type={showConfirm ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="Re-enter password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      style={{
                        borderColor: pwMatch === null ? undefined : pwMatch ? '#22c55e' : '#ef4444',
                        boxShadow: pwMatch === null ? undefined : pwMatch
                          ? '0 0 0 3px rgba(34,197,94,0.1)'
                          : '0 0 0 3px rgba(239,68,68,0.1)',
                      }}
                      rightEl={
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#484f58', display: 'flex', padding: 0 }}>
                          {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      }
                    />
                    <AnimatePresence>
                      {form.confirmPassword && (
                        <motion.p
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          style={{
                            fontSize: 11, marginTop: -10, marginBottom: 14,
                            color: pwMatch ? '#22c55e' : '#ef4444',
                            display: 'flex', alignItems: 'center', gap: 4,
                          }}
                        >
                          {pwMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.015, boxShadow: '0 0 30px rgba(99,102,241,0.5)' } : {}}
                  whileTap={!loading ? { scale: 0.97 } : {}}
                  style={{
                    width: '100%',
                    padding: '13px 20px',
                    borderRadius: 11,
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    background: loading
                      ? 'rgba(99,102,241,0.4)'
                      : 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                    color: 'white',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    marginTop: 4,
                    boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.35)',
                    transition: 'background 0.2s, box-shadow 0.2s',
                  }}
                >
                  {loading ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        style={{ display: 'inline-block', width: 16, height: 16,
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTop: '2px solid white',
                          borderRadius: '50%',
                        }}
                      />
                      {isLogin ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight size={15} />
                    </>
                  )}
                </motion.button>

              </form>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Footer hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#30363d' }}
        >
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => switchMode(isLogin ? 'register' : 'login')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#6366f1', fontWeight: 600, fontSize: 12,
            }}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </motion.p>

      </motion.div>
    </div>
  )
}