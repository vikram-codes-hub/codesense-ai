import { useState } from 'react'
import api from '../utils/axios'
import useReviewStore from '../store/reviewStore'
import toast from 'react-hot-toast'

export const useReview = () => {
  const {
    reviews, currentReview, liveUpdates, loading,
    setReviews, setCurrentReview, setLoading,
    addLiveUpdate, clearLiveUpdates, updateReviewStatus,
  } = useReviewStore()

  const [reviewFiles,  setReviewFiles]  = useState([])
  const [filesLoading, setFilesLoading] = useState(false)

  const fetchReviews = async (params = {}) => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/reviews', { params })
      setReviews(data.data.reviews)
      return data.data
    } catch (err) {
      toast.error('Failed to fetch reviews')
    } finally {
      setLoading(false)
    }
  }

  const fetchReview = async (id) => {
    setLoading(true)
    try {
      const { data } = await api.get(`/api/reviews/${id}`)
      setCurrentReview(data.data)
      return data.data
    } catch (err) {
      toast.error('Failed to fetch review')
    } finally {
      setLoading(false)
    }
  }

  const fetchReviewFiles = async (reviewId) => {
    setFilesLoading(true)
    try {
      const { data } = await api.get(`/api/reviews/${reviewId}/files`)
      setReviewFiles(data.data.files)
      return data.data.files
    } catch (err) {
      toast.error('Failed to fetch files')
      return []
    } finally {
      setFilesLoading(false)
    }
  }

  const submitManualReview = async (code, language, filename) => {
    try {
      const { data } = await api.post('/api/reviews/manual', { code, language, filename })
      toast.success('Review queued!')
      return data.data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
      throw err
    }
  }

  const deleteReview = async (reviewId) => {
    try {
      await api.delete(`/api/reviews/${reviewId}`)
      setReviews(prev => prev.filter(r => r._id !== reviewId))
      toast.success('Review deleted')
    } catch (err) {
      toast.error('Failed to delete review')
      throw err
    }
  }

  // ── Get AI Fix for an issue ──────────────────────────────
  const getAIFix = async (reviewId, issueId) => {
    try {
      const { data } = await api.post(`/api/reviews/${reviewId}/issues/${issueId}/ai-fix`)
      return data.data
    } catch (err) {
      const msg = err.response?.data?.message || 'AI service unavailable'
      toast.error(msg)
      throw err
    }
  }

  return {
    reviews,
    currentReview,
    reviewFiles,
    liveUpdates,
    loading,
    filesLoading,
    fetchReviews,
    fetchReview,
    fetchReviewFiles,
    submitManualReview,
    deleteReview,
    getAIFix,
    addLiveUpdate,
    clearLiveUpdates,
    updateReviewStatus,
  }
}