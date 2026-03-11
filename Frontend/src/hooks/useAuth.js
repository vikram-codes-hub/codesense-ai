import { useAuth as useAuthContext } from '../context/AuthContext'
import api from '../utils/axios'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export const useAuth = () => {
  const context = useAuthContext()
  const navigate = useNavigate()

  const loginUser = async (email, password) => {
    try {
      // TODO: swap with real API
      // const { data } = await api.post('/api/auth/login', { email, password })
      // context.login(data.data.user, data.data.token)
      context.login({ email }, 'mock_token')
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
      throw err
    }
  }

  const registerUser = async (name, email, password) => {
    try {
      // TODO: swap with real API
      // const { data } = await api.post('/api/auth/register', { name, email, password })
      // context.login(data.data.user, data.data.token)
      context.login({ name, email }, 'mock_token')
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
      throw err
    }
  }

  const logoutUser = async () => {
    try {
      // TODO: await api.post('/api/auth/logout')
      context.logout()
      navigate('/auth')
    } catch (err) {
      context.logout()
      navigate('/auth')
    }
  }

  return {
    ...context,
    loginUser,
    registerUser,
    logoutUser,
  }
}