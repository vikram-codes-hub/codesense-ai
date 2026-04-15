import axios from 'axios'

const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL,
  withCredentials: true,
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto logout on 401 (except on auth routes)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if already on auth page or if it's an auth endpoint
      if (!window.location.pathname.includes('/auth')) {
        localStorage.removeItem('token')
        window.location.href = '/auth'
      }
    }
    return Promise.reject(error)
  }
)

export default api