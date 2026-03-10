import { useState, useEffect } from 'react'
import { GitBranch, Search, X, Star, Lock, Globe, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

// Mock GitHub repos to search from
const mockGithubRepos = [
  { id: '111', name: 'codesense-ai',      fullName: 'vikramsingh/codesense-ai',      language: 'JavaScript', isPrivate: false, stars: 24 },
  { id: '222', name: 'ecommerce-api',     fullName: 'vikramsingh/ecommerce-api',     language: 'Python',     isPrivate: false, stars: 12 },
  { id: '333', name: 'portfolio-web',     fullName: 'vikramsingh/portfolio-web',     language: 'TypeScript', isPrivate: false, stars: 8  },
  { id: '444', name: 'ml-pipeline',       fullName: 'vikramsingh/ml-pipeline',       language: 'Python',     isPrivate: true,  stars: 3  },
  { id: '555', name: 'discord-bot',       fullName: 'vikramsingh/discord-bot',       language: 'JavaScript', isPrivate: false, stars: 31 },
  { id: '666', name: 'auth-service',      fullName: 'vikramsingh/auth-service',      language: 'TypeScript', isPrivate: true,  stars: 5  },
  { id: '777', name: 'data-viz-dashboard',fullName: 'vikramsingh/data-viz-dashboard',language: 'React',      isPrivate: false, stars: 17 },
]

const langColors = {
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  Python:     '#3572a5',
  React:      '#61dafb',
  default:    '#6b7280',
}

export default function ConnectRepoModal({ onClose, onConnect, alreadyConnected = [] }) {
  const [search, setSearch] = useState('')
  const [filtered, setFiltered] = useState(mockGithubRepos)
  const [connecting, setConnecting] = useState(null)

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(mockGithubRepos.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.fullName.toLowerCase().includes(q)
    ))
  }, [search])

  const handleConnect = async (repo) => {
    if (alreadyConnected.includes(repo.id)) return
    setConnecting(repo.id)
    try {
      await new Promise(r => setTimeout(r, 900))
      onConnect(repo)
      toast.success(`${repo.name} connected!`)
      onClose()
    } catch {
      toast.error('Failed to connect repo')
    } finally {
      setConnecting(null)
    }
  }

  return (
    <>
      {/* ── Backdrop ──────────────────────────────── */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* ── Modal ─────────────────────────────────── */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%', maxWidth: 520,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        zIndex: 101,
        animation: 'slideUp 0.25s ease-out',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <GitBranch size={17} color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                Connect Repository
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Select a GitHub repo to enable auto reviews
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: 4, borderRadius: 6,
              display: 'flex', alignItems: 'center', transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              className="input"
              placeholder="Search repositories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              style={{ paddingLeft: 34 }}
            />
          </div>
        </div>

        {/* Repo List */}
        <div style={{ maxHeight: 360, overflowY: 'auto', padding: '8px 12px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              No repositories found
            </div>
          ) : (
            filtered.map(repo => {
              const isConnected = alreadyConnected.includes(repo.id)
              const isConnecting = connecting === repo.id
              const langColor = langColors[repo.language] || langColors.default

              return (
                <div
                  key={repo.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 10px', borderRadius: 8, marginBottom: 4,
                    background: isConnected ? 'rgba(34,197,94,0.04)' : 'transparent',
                    border: `1px solid ${isConnected ? 'rgba(34,197,94,0.15)' : 'transparent'}`,
                    transition: 'all 0.15s',
                    cursor: isConnected ? 'default' : 'pointer',
                  }}
                  onMouseEnter={e => { if (!isConnected) e.currentTarget.style.background = 'var(--bg-tertiary)' }}
                  onMouseLeave={e => { if (!isConnected) e.currentTarget.style.background = 'transparent' }}
                >
                  {/* Repo info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 7,
                      background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {repo.isPrivate
                        ? <Lock size={14} color="var(--text-muted)" />
                        : <Globe size={14} color="var(--accent)" />
                      }
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                          {repo.name}
                        </span>
                        {repo.isPrivate && (
                          <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'var(--bg-tertiary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                            private
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: langColor }} />
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{repo.language}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Star size={10} color="var(--text-muted)" />
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{repo.stars}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Connect button */}
                  {isConnected ? (
                    <span style={{ fontSize: 12, color: 'var(--grade-a)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                      ✓ Connected
                    </span>
                  ) : (
                    <button
                      onClick={() => handleConnect(repo)}
                      disabled={isConnecting}
                      style={{
                        padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 500,
                        background: isConnecting ? 'var(--bg-tertiary)' : 'rgba(99,102,241,0.1)',
                        border: `1px solid ${isConnecting ? 'var(--border)' : 'rgba(99,102,241,0.3)'}`,
                        color: isConnecting ? 'var(--text-muted)' : 'var(--accent)',
                        cursor: isConnecting ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: 5,
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={e => { if (!isConnecting) e.currentTarget.style.background = 'rgba(99,102,241,0.2)' }}
                      onMouseLeave={e => { if (!isConnecting) e.currentTarget.style.background = 'rgba(99,102,241,0.1)' }}
                    >
                      {isConnecting && <Loader size={11} style={{ animation: 'spin 0.8s linear infinite' }} />}
                      {isConnecting ? 'Connecting...' : 'Connect'}
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {filtered.length} repositories found
          </span>
          <button onClick={onClose} className="btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }}>
            Cancel
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}