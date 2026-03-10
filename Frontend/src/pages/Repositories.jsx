import { useState } from 'react'
import { GitBranch, Plus, Search } from 'lucide-react'
import { mockRepos } from '../utils/mockData'
import RepoCard from '../components/Repostries/RepoCard'
import ConnectRepoModal from '../components/Repostries/ConnectRepoModal'
import toast from 'react-hot-toast'

export default function Repositories() {
  const [repos, setRepos] = useState(mockRepos)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  const filtered = repos.filter(r =>
    r.repoName.toLowerCase().includes(search.toLowerCase()) ||
    r.repoFullName.toLowerCase().includes(search.toLowerCase())
  )

  const handleDisconnect = (repoId) => {
    setRepos(repos.filter(r => r._id !== repoId))
    toast.success('Repository disconnected')
  }

  const handleConnect = (githubRepo) => {
    const newRepo = {
      _id: `repo_${Date.now()}`,
      repoName: githubRepo.name,
      repoFullName: githubRepo.fullName,
      githubRepoId: githubRepo.id,
      isConnected: true,
      avgScore: null,
      language: githubRepo.language,
      lastReviewAt: null,
    }
    setRepos([newRepo, ...repos])
  }

  const connectedIds = repos.map(r => r.githubRepoId)

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>

      {/* ── Header ────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Repositories
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {repos.filter(r => r.isConnected).length} connected · {repos.length} total
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
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 0',
          color: 'var(--text-muted)', fontSize: 14,
        }}>
          <GitBranch size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p>No repositories found</p>
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
          alreadyConnected={connectedIds}
        />
      )}
    </div>
  )
}