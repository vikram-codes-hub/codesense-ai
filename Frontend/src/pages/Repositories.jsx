import { useState, useEffect } from 'react'
import { GitBranch, Plus, Search } from 'lucide-react'
import { useRepo } from '../hooks/useRepo'
import RepoCard         from '../components/Repostries/Repocard'
import ConnectRepoModal from '../components/Repostries/ConnectRepoModal'

export default function Repositories() {
  const {
    repos, loading,
    fetchRepos, connectRepo, disconnectRepo,
  } = useRepo()

  const [search,    setSearch]    = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchRepos()
  }, [])

  const filtered = repos.filter(r =>
    r.repoName?.toLowerCase().includes(search.toLowerCase()) ||
    r.repoFullName?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDisconnect = async (repoId) => {
    await disconnectRepo(repoId)
  }

  const handleConnect = async (githubRepo) => {
    await connectRepo({
      repoName:     githubRepo.name,
      repoFullName: githubRepo.fullName,
      githubRepoId: githubRepo.id,
      language:     githubRepo.language || 'Unknown',
    })
    setShowModal(false)
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>

      {/* ── Header ────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Repositories
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {repos.length} connected
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px' }}
        >
          <Plus size={16} />
          Connect Repo
        </button>
      </div>

      {/* ── Search ────────────────────────────────── */}
      <div style={{ position: 'relative', marginBottom: 20, maxWidth: 360 }}>
        <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          className="input"
          placeholder="Search repositories..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: 34 }}
        />
      </div>

      {/* ── Grid ──────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 0',
          color: 'var(--text-muted)', fontSize: 14,
        }}>
          <GitBranch size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p>{repos.length === 0 ? 'No repositories connected yet' : 'No repositories found'}</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 16,
        }}>
          {filtered.map(repo => (
            <RepoCard
              key={repo._id}
              repo={repo}
              onDisconnect={handleDisconnect}
            />
          ))}
        </div>
      )}

      {/* ── Modal ─────────────────────────────────── */}
      {showModal && (
        <ConnectRepoModal
          onClose={() => setShowModal(false)}
          onConnect={handleConnect}
          alreadyConnected={repos.map(r => r.githubRepoId)}
        />
      )}
    </div>
  )
}