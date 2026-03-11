import { create } from 'zustand'

const useReviewStore = create((set, get) => ({
  reviews:       [],
  currentReview: null,
  liveUpdates:   [],
  loading:       false,
  error:         null,

  setReviews:       (reviews)       => set({ reviews }),
  setCurrentReview: (review)        => set({ currentReview: review }),
  setLoading:       (loading)       => set({ loading }),
  setError:         (error)         => set({ error }),

  addLiveUpdate: (event) => set((state) => ({
    liveUpdates: [...state.liveUpdates, event],
  })),

  clearLiveUpdates: () => set({ liveUpdates: [] }),

  // Update review status in list
  updateReviewStatus: (reviewId, status, data = {}) => set((state) => ({
    reviews: state.reviews.map(r =>
      r._id === reviewId ? { ...r, status, ...data } : r
    ),
    currentReview: state.currentReview?._id === reviewId
      ? { ...state.currentReview, status, ...data }
      : state.currentReview,
  })),
}))

export default useReviewStore