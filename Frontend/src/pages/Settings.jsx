import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../utils/axios'
import { User, Shield, Github, Bell, Trash2, Save, Camera } from 'lucide-react'
import toast from 'react-hot-toast'

const Section = ({ title, icon: Icon, accent = false, children }) => (
  <div style={{
    background: 'var(--bg-secondary)',
    border:     `1px solid ${accent ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
    borderRadius: 12, overflow: 'hidden',
  }}>
    <div style={{
      padding: '16px 24px', borderBottom: `1px solid ${accent ? 'rgba(239,68,68,0.2)' : 'var(--border)'}`,
      display: 'flex', alignItems: 'center', gap: 10,
      background: accent ? 'rgba(239,68,68,0.03)' : 'transparent',
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8,
        background: accent ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)',
        border: `1px solid ${accent ? 'rgba(239,68,68,0.2)' : 'rgba(99,102,241,0.2)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={15} color={accent ? 'var(--critical)' : 'var(--accent)'} />
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{title}</h3>
    </div>
    <div style={{ padding: 24 }}>{children}</div>
  </div>
)

const Field = ({ label, hint, children }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 7 }}>
      {label}
    </label>
    {children}
    {hint && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>{hint}</p>}
  </div>
)

export default function Settings() {
  const { user, setUser, logout } = useAuth()
  const navigate = useNavigate()

  const [profile,  setProfile]  = useState({ name: user?.name || '', email: user?.email || '' })
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' })
  const [notifications, setNotifications] = useState({ email: true, webhook: true, weekly: false })
  const [saving, setSaving] = useState(null)

  const handleSaveProfile = async () => {
    if (!profile.name || !profile.email) { toast.error('Please fill in all fields'); return }
    setSaving('profile')
    try {
      const { data } = await api.put('/api/auth/profile', profile)
      setUser({ ...user, ...profile })
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(null)
    }
  }

  const handleSavePassword = async () => {
    if (!passwords.current)              { toast.error('Enter current password');           return }
    if (passwords.newPass.length < 6)    { toast.error('Password must be at least 6 chars'); return }
    if (passwords.newPass !== passwords.confirm) { toast.error('Passwords do not match');   return }
    setSaving('password')
    try {
      await api.put('/api/auth/password', {
        currentPassword: passwords.current,
        newPassword:     passwords.newPass,
      })
      toast.success('Password updated!')
      setPasswords({ current: '', newPass: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password')
    } finally {
      setSaving(null)
    }
  }

  const handleConnectGitHub = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/github`
  }

  return (
    <div style={{ maxWidth: 680, animation: 'fadeIn 0.3s ease-out' }}>

      {/* ── Profile ─────────────────────────────── */}
      <Section title="Profile" icon={User}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 20,
          padding: 16, borderRadius: 10,
          background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
          marginBottom: 24,
        }}>
          <div style={{ position: 'relative' }}>
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6366f1&color=fff&size=80`}
              alt="avatar"
              style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid var(--accent)', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 22, height: 22, borderRadius: '50%',
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--bg-tertiary)', cursor: 'pointer',
            }}>
              <Camera size={11} color="white" />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
              {user?.name || 'Your Name'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 8px' }}>
              {user?.email || 'your@email.com'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                background: user?.plan === 'pro' ? 'rgba(99,102,241,0.15)' : 'rgba(139,148,158,0.15)',
                color:      user?.plan === 'pro' ? 'var(--accent)'          : 'var(--text-muted)',
                border: `1px solid ${user?.plan === 'pro' ? 'rgba(99,102,241,0.3)' : 'rgba(139,148,158,0.2)'}`,
              }}>
                {user?.plan === 'pro' ? '⚡ Pro Plan' : '🆓 Free Plan'}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {user?.totalReviews || 0} reviews completed
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Full Name">
            <input className="input" value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
              placeholder="Your full name" />
          </Field>
          <Field label="Email" hint="Used for notifications and login">
            <input className="input" type="email" value={profile.email}
              onChange={e => setProfile({ ...profile, email: e.target.value })}
              placeholder="you@example.com" />
          </Field>
        </div>

        <button onClick={handleSaveProfile} disabled={saving === 'profile'} className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: saving === 'profile' ? 0.7 : 1 }}>
          <Save size={14} />
          {saving === 'profile' ? 'Saving...' : 'Save Profile'}
        </button>
      </Section>

      <div style={{ height: 16 }} />

      {/* ── Security ────────────────────────────── */}
      <Section title="Security" icon={Shield}>
        <Field label="Current Password">
          <input className="input" type="password" value={passwords.current}
            onChange={e => setPasswords({ ...passwords, current: e.target.value })}
            placeholder="Enter current password" />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="New Password">
            <input className="input" type="password" value={passwords.newPass}
              onChange={e => setPasswords({ ...passwords, newPass: e.target.value })}
              placeholder="Min 6 characters" />
          </Field>
          <Field label="Confirm New Password">
            <input className="input" type="password" value={passwords.confirm}
              onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
              placeholder="Re-enter password"
              style={{ borderColor: passwords.confirm ? passwords.newPass === passwords.confirm ? 'var(--grade-a)' : 'var(--critical)' : undefined }}
            />
            {passwords.confirm && (
              <p style={{ fontSize: 11, marginTop: 4, color: passwords.newPass === passwords.confirm ? 'var(--grade-a)' : 'var(--critical)' }}>
                {passwords.newPass === passwords.confirm ? '✓ Passwords match' : '✗ Do not match'}
              </p>
            )}
          </Field>
        </div>
        <button onClick={handleSavePassword} disabled={saving === 'password'} className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: saving === 'password' ? 0.7 : 1 }}>
          <Save size={14} />
          {saving === 'password' ? 'Saving...' : 'Update Password'}
        </button>
      </Section>

      <div style={{ height: 16 }} />

      {/* ── GitHub ──────────────────────────────── */}
      <Section title="GitHub Connection" icon={Github}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', borderRadius: 10,
          background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Github size={20} color="var(--text-primary)" />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                {user?.githubId ? `Connected` : 'Not connected'}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                {user?.githubId ? 'GitHub account linked ✓' : 'Connect to enable PR webhook reviews'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: user?.githubId ? 'var(--grade-a)' : 'var(--text-muted)',
              boxShadow: user?.githubId ? '0 0 6px #22c55e' : 'none',
            }} />
            <button
              className={user?.githubId ? 'btn-secondary' : 'btn-primary'}
              style={{ fontSize: 12, padding: '6px 14px' }}
              onClick={handleConnectGitHub}
            >
              {user?.githubId ? 'Reconnect' : 'Connect GitHub'}
            </button>
          </div>
        </div>
      </Section>

      <div style={{ height: 16 }} />

      {/* ── Notifications ───────────────────────── */}
      <Section title="Notifications" icon={Bell}>
        {[
          { key: 'email',   label: 'Email notifications', hint: 'Get notified when reviews complete' },
          { key: 'webhook', label: 'Webhook alerts',       hint: 'Notify on critical issues found'   },
          { key: 'weekly',  label: 'Weekly summary',       hint: 'Weekly digest of code quality trends' },
        ].map(({ key, label, hint }, i, arr) => (
          <div key={key} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 0',
            borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>{label}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>{hint}</p>
            </div>
            <div
              onClick={() => setNotifications({ ...notifications, [key]: !notifications[key] })}
              style={{
                width: 44, height: 24, borderRadius: 12,
                background: notifications[key] ? 'var(--accent)' : 'var(--bg-tertiary)',
                border: `1px solid ${notifications[key] ? 'var(--accent)' : 'var(--border)'}`,
                cursor: 'pointer', position: 'relative', transition: 'all 0.25s',
                boxShadow: notifications[key] ? '0 0 10px var(--accent-glow)' : 'none',
                flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute', top: 3,
                left: notifications[key] ? 22 : 3,
                width: 16, height: 16, borderRadius: '50%',
                background: 'white', transition: 'left 0.25s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            </div>
          </div>
        ))}
      </Section>

      <div style={{ height: 16 }} />

      {/* ── Danger Zone ─────────────────────────── */}
      <Section title="Danger Zone" icon={Trash2} accent={true}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', borderRadius: 10,
          background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)',
        }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Delete Account</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Permanently delete your account and all data. This cannot be undone.
            </p>
          </div>
          <button
            onClick={() => toast.error('Contact support to delete your account')}
            className="btn-danger"
            style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, marginLeft: 16 }}
          >
            <Trash2 size={13} /> Delete Account
          </button>
        </div>
      </Section>

      <div style={{ height: 32 }} />
    </div>
  )
}