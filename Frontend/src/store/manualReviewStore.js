import { create } from 'zustand'

const useManualReviewStore = create((set) => ({
  // State
  code:       '',
  language:   'javascript',
  loading:    false,
  analyzed:   false,
  reviewId:   null,
  result:     null,
  issues:     [],
  liveEvents: [],

  // Actions
  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
  setLoading: (loading) => set({ loading }),
  setAnalyzed: (analyzed) => set({ analyzed }),
  setReviewId: (reviewId) => set({ reviewId }),
  setResult: (result) => set({ result }),
  setIssues: (issues) => set({ issues }),
  setLiveEvents: (liveEvents) => set({ liveEvents }),
  
  // Add event to live feed
  addEvent: (event, message) => set((state) => ({
    liveEvents: [...state.liveEvents, {
      id:      Date.now(),
      event,
      message,
      time:    new Date().toLocaleTimeString(),
    }]
  })),

  // Reset all
  reset: () => set({
    code:       '',
    loading:    false,
    analyzed:   false,
    result:     null,
    issues:     [],
    liveEvents: [],
    reviewId:   null,
  }),

  // Start analysis
  startAnalysis: () => set({
    loading:    true,
    analyzed:   false,
    result:     null,
    issues:     [],
    liveEvents: [],
  }),

  // Complete analysis
  completeAnalysis: (result, issues) => set({
    loading:   false,
    analyzed:  true,
    result,
    issues,
  }),

  // Stop analysis
  stopAnalysis: () => set({
    loading:   false,
    analyzed:  false,
    reviewId:  null,
  }),
}))

export default useManualReviewStore
