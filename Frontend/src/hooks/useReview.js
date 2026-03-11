import { useState } from 'react'
import { mockReviews, mockReviewFiles, mockIssues } from '../utils/mockData'
import useReviewStore from '../store/reviewStore'
import toast from 'react-hot-toast'
// import api from '../utils/axios'

export const useReview = () => {
  const {
    reviews, currentReview, liveUpdates, loading,
    setReviews, setCurrentReview, setLoading,
    addLiveUpdate, clearLiveUpdates, updateReviewStatus,
  } = useReviewStore()

  const fetchReviews = async () => {
    setLoading(true)
    try {
      // TODO: const { data } = await api.get('/api/reviews')
      // setReviews(data.data)
      await new Promise(r => setTimeout(r, 500))
      setReviews(mockReviews)
    } catch (err) {
      toast.error('Failed to fetch reviews')
    } finally {
      setLoading(false)
    }
  }

  const fetchReview = async (id) => {
    setLoading(true)
    try {
      // TODO: const { data } = await api.get(`/api/reviews/${id}`)
      // setCurrentReview(data.data)
      await new Promise(r => setTimeout(r, 300))
      const review = mockReviews.find(r => r._id === id) || mockReviews[0]
      setCurrentReview(review)
    } catch (err) {
      toast.error('Failed to fetch review')
    } finally {
      setLoading(false)
    }
  }

  const fetchReviewFiles = async (reviewId) => {
    try {
      // TODO: const { data } = await api.get(`/api/reviews/${reviewId}/files`)
      return mockReviewFiles.filter(f => f.reviewId === reviewId)
    } catch (err) {
      toast.error('Failed to fetch files')
      return []
    }
  }

  return {
    reviews,
    currentReview,
    liveUpdates,
    loading,
    fetchReviews,
    fetchReview,
    fetchReviewFiles,
    addLiveUpdate,
    clearLiveUpdates,
    updateReviewStatus,
  }
}