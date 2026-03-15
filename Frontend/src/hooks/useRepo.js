import { useState } from 'react'
import api from '../utils/axios'
import toast from 'react-hot-toast'

export const useRepo = () => {
  const [repos,          setRepos]   = useState([])
  const [githubRepos,    setGithubRepos] = useState([])
  const [loading,        setLoading] = useState(false)
  const [githubLoading,  setGithubLoading] = useState(false)

  const fetchRepos = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/repos')
      setRepos(data.data.repos)
    } catch (err) {
      toast.error('Failed to fetch repositories')
    } finally {
      setLoading(false)
    }
  }

  const fetchGithubRepos = async () => {
    setGithubLoading(true)
    try {
      const { data } = await api.get('/api/repos/github')
      setGithubRepos(data.data.repos)
    } catch (err) {
      toast.error('Failed to fetch GitHub repositories')
    } finally {
      setGithubLoading(false)
    }
  }

  const connectRepo = async (repoData) => {
    try {
      const { data } = await api.post('/api/repos/connect', repoData)
      setRepos(prev => [...prev, data.data.repo])
      toast.success(`Connected ${repoData.repoFullName}!`)
      return data.data.repo
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to connect repository')
      throw err
    }
  }

  const disconnectRepo = async (repoId) => {
    try {
      await api.delete(`/api/repos/${repoId}`)
      setRepos(prev => prev.filter(r => r._id !== repoId))
      toast.success('Repository disconnected')
    } catch (err) {
      toast.error('Failed to disconnect repository')
      throw err
    }
  }

  return {
    repos,
    githubRepos,
    loading,
    githubLoading,
    fetchRepos,
    fetchGithubRepos,
    connectRepo,
    disconnectRepo,
  }
}