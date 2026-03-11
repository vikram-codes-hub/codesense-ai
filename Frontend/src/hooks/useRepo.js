import { useState } from 'react'
import { mockRepos } from '../utils/mockData'
import toast from 'react-hot-toast'
// import api from '../utils/axios'

export const useRepo = () => {
  const [repos, setRepos]     = useState(mockRepos)
  const [loading, setLoading] = useState(false)

  const fetchRepos = async () => {
    setLoading(true)
    try {
      // TODO: const { data } = await api.get('/api/repos')
      // setRepos(data.data)
      await new Promise(r => setTimeout(r, 500))
      setRepos(mockRepos)
    } catch (err) {
      toast.error('Failed to fetch repositories')
    } finally {
      setLoading(false)
    }
  }

  const connectRepo = async (repoFullName) => {
    try {
      // TODO: const { data } = await api.post('/api/repos/connect', { repoFullName })
      // setRepos(prev => [...prev, data.data])
      toast.success(`Connected ${repoFullName}!`)
    } catch (err) {
      toast.error('Failed to connect repository')
      throw err
    }
  }

  const disconnectRepo = async (repoId) => {
    try {
      // TODO: await api.delete(`/api/repos/${repoId}`)
      setRepos(prev => prev.filter(r => r._id !== repoId))
      toast.success('Repository disconnected')
    } catch (err) {
      toast.error('Failed to disconnect repository')
      throw err
    }
  }

  return { repos, loading, fetchRepos, connectRepo, disconnectRepo }
}