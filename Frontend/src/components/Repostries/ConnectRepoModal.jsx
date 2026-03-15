import { useState, useEffect } from 'react'
import { GitBranch, Search, X, Star, Lock, Globe, Loader } from 'lucide-react'
import api from '../../utils/axios'
import toast from 'react-hot-toast'

const langColors = {
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  Python:     '#3572a5',
  React:      '#61dafb',
  default:    '#6b7280',
}

export default function ConnectRepoModal({ onClose, onConnect, alreadyConnected = [] }) {
  const [repos,      setRepos]      = useState([])
  const [search,     setSearch]     = useState('')
  const [loading,    setLoading]    = useState(true)
  const [connecting, setConnecting] = useState(null)

  useEffect(() => {
    const fetchRepos = async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/api/repos/github')
        setRepos(data.data?.repos || [])
      } catch (err) {
        toast.error('Failed to fetch GitHub repos')
      } finally {
        setLoading(false)
      }
    }
    fetchRepos()
  }, [])

  const filtered = repos.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.fullName?.toLowerCase().includes(search.toLowerCase())
  )

const handleConnect = async (repo) => {
  if (alreadyConnected.includes(repo.id)) return
  setConnecting(repo.id)
  try {
    const { data } = await api.post('/api/repos/connect', {
      repoFullName: repo.fullName,
      repoName:     repo.name,
      githubRepoId: String(repo.id),
      language:     repo.language,
      isPrivate:    repo.isPrivate,
    })
    onConnect(data.data?.repo || repo)
    toast.success(`${repo.name} connected!`)
    onClose()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to connect repo')
  } finally {
    setConnecting(null)
  }
}
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 100, animation: 'fadeIn 0.2s ease',
      }} />

      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%', maxWidth: 520,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 14, zIndex: 101,
        animation: 'slideUp 0.25s ease-out',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          padding: '18px 20px', borderBottom: '1px solid var(--border)',
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
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Connect Repository</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Select a GitHub repo to enable auto reviews</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: 4, borderRadius: 6,
            display: 'flex', alignItems: 'center',
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
            <input className="input" placeholder="Search repositories..."
              value={search} onChange={e => setSearch(e.target.value)}
              autoFocus style={{ paddingLeft: 34 }} />
          </div>
        </div>

        {/* Repo List */}
        <div style={{ maxHeight: 360, overflowY: 'auto', padding: '8px 12px' }}>
          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <Loader size={20} color="var(--accent)" style={{ animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }} />
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading your repos...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              No repositories found
            </div>
          ) : (
            filtered.map(repo => {
              const isConnected  = alreadyConnected.includes(repo.id)
              const isConnecting = connecting === repo.id
              const langColor    = langColors[repo.language] || langColors.default

              return (
                <div key={repo.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 10px', borderRadius: 8, marginBottom: 4,
                  background: isConnected ? 'rgba(34,197,94,0.04)' : 'transparent',
                  border: `1px solid ${isConnected ? 'rgba(34,197,94,0.15)' : 'transparent'}`,
                  transition: 'all 0.15s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 7,
                      background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {repo.isPrivate
                        ? <Lock size={14} color="var(--text-muted)" />
                        : <Globe size={14} color="var(--accent)" />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{repo.name}</span>
                        {repo.isPrivate && (
                          <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'var(--bg-tertiary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                            private
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: langColor }} />
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{repo.language || 'Unknown'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Star size={10} color="var(--text-muted)" />
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{repo.stars || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isConnected ? (
                    <span style={{ fontSize: 12, color: 'var(--grade-a)', fontWeight: 500 }}>✓ Connected</span>
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
                        whiteSpace: 'nowrap',
                      }}
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
          padding: '12px 20px', borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {loading ? 'Loading...' : `${filtered.length} repositories found`}
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