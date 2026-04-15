import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/axios'

const AuthContext = createContext({
  user:            null,
  token:           null,
  isAuthenticated: false,
  loading:         true,
  login:           () => {},
  logout:          () => {},
  setUser:         () => {},
})

export const AuthProvider = ({ children }) => {
  const [user,            setUser]            = useState(null)
  const [token,           setToken]           = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading,         setLoading]         = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      setToken(savedToken)
      api.get('/api/auth/me')
        .then(({ data }) => {
          setUser(data.data)
          setIsAuthenticated(true)
        })
        .catch((err) => {
          // Token is invalid or expired, clear it
          localStorage.removeItem('token')
          setToken(null)
          setIsAuthenticated(false)
          console.error('Token verification failed:', err.message)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (userData, tokenData) => {
    setUser(userData)
    setToken(tokenData)
    setIsAuthenticated(true)
    localStorage.setItem('token', tokenData)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setIsAuthenticated(false)
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{
      user, token, isAuthenticated, loading, login, logout, setUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

/* ── LayoutContext ─────────────────────────────────────
   Placed here to avoid creating a new file.
   Import useLayout wherever you need sidebarOpen state.
──────────────────────────────────────────────────────── */
const LayoutContext = createContext(null)

export const LayoutProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isNarrow,    setIsNarrow]    = useState(false)

  useEffect(() => {
    const check = () => {
      const narrow = window.innerWidth < 768
      setIsNarrow(narrow)
      setSidebarOpen(!narrow)          // wide → open by default; narrow → closed
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <LayoutContext.Provider value={{ sidebarOpen, setSidebarOpen, isNarrow }}>
      {children}
    </LayoutContext.Provider>
  )
}

export const useLayout = () => useContext(LayoutContext)