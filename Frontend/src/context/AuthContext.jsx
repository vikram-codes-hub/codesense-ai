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
        .catch(() => {

          localStorage.removeItem('token')
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