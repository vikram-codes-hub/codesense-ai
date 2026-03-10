import { createContext, useContext, useState, useEffect } from 'react'
import { mockUser } from '../utils/mockData'

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  login: () => {},
  logout: () => {},
  setUser: () => {},
})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // ── Load from localStorage on mount ──────────
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      // TODO: swap with real API call later
      setUser(mockUser)
      setToken(savedToken)
      setIsAuthenticated(true)
    }
    setLoading(false)
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
      user,
      token,
      isAuthenticated,
      loading,
      login,
      logout,
      setUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)