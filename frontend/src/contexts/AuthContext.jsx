import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

async function apiPost(endpoint, body) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.detail || `Request failed (${res.status})`)
  return data
}

async function apiGet(endpoint, token) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.detail || `Request failed (${res.status})`)
  return data
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(() => localStorage.getItem('eduinsight_token') || null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  // Wake up the Render backend immediately on app load (free tier spins down after inactivity).
  // Fire-and-forget — we don't await or block on this.
  useEffect(() => {
    fetch(`${API_BASE}/health`).catch(() => {/* silently ignore — backend may still be starting */})
  }, [])

  // On mount: if we have a stored token, validate it with the backend /me endpoint
  useEffect(() => {
    const storedToken = localStorage.getItem('eduinsight_token')
    if (!storedToken) {
      setLoading(false)
      return
    }
    apiGet('/auth/me', storedToken)
      .then(userData => {
        setUser(userData)
        setToken(storedToken)
      })
      .catch(() => {
        // Token invalid/expired — clear it
        localStorage.removeItem('eduinsight_token')
        setToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    setError(null)
    setLoading(true)
    try {
      const data = await apiPost('/auth/login', { email, password })
      const { access_token, user: userData } = data
      localStorage.setItem('eduinsight_token', access_token)
      setToken(access_token)
      setUser(userData)
      setLoading(false)
      return true
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
      setLoading(false)
      return false
    }
  }, [])

  const register = useCallback(async (formData) => {
    setError(null)
    setLoading(true)
    try {
      const data = await apiPost('/auth/register', {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role || 'student',
        department: formData.department || '',
      })
      const { access_token, user: userData } = data
      localStorage.setItem('eduinsight_token', access_token)
      setToken(access_token)
      setUser(userData)
      setLoading(false)
      return true
    } catch (err) {
      setError(err.message || 'Registration failed.')
      setLoading(false)
      return false
    }
  }, [])

  const logout = useCallback(() => {
    // Clear ALL private state — prevents stale data showing for next user
    localStorage.removeItem('eduinsight_token')
    setToken(null)
    setUser(null)
    setError(null)
  }, [])

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    setError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthProvider
