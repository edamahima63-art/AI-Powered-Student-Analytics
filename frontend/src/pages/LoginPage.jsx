import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const { login, error, loading, setError } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }
    const success = await login(email, password)
    if (success) navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: Decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero-subtle items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-royal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-lavender-500/8 rounded-full blur-3xl"></div>
        <div className="relative text-center max-w-md">
          <div className="w-16 h-16 gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-8">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4">Welcome back to EduInsight</h2>
          <p className="text-white/50 leading-relaxed">
            Sign in to access your personalized academic dashboard, analytics, and AI-powered recommendations.
          </p>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-transparent">
        {/* Ambient background glow orbs */}
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-royal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md card p-8 sm:p-10 shadow-card-hover border-royal-100/60 backdrop-blur-xl relative z-10">
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 gradient-accent rounded-lg flex items-center justify-center shadow-xs">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="font-extrabold text-lg text-navy-900 font-display">EduInsight</span>
          </div>

          <h1 className="text-2xl font-extrabold text-navy-900 mb-2 font-display">Sign in to your account</h1>
          <p className="text-sm text-text-secondary mb-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-royal-500 font-semibold hover:text-royal-600">Create one</Link>
          </p>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-6 animate-fade-in">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input pl-10"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-text-primary mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input pl-10 pr-10"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full btn-lg font-bold disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>



          <p className="mt-6 text-center text-xs text-text-tertiary">
            <Link to="/" className="hover:text-text-secondary">← Back to homepage</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
