import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GraduationCap, User, Mail, Lock, ArrowRight, AlertCircle, Building2 } from 'lucide-react'

export default function RegisterPage() {
  const { register, error, loading, setError } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student', department: '' })

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all required fields.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    const success = await register(form)
    if (success) navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-transparent relative overflow-hidden">
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-royal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 gradient-accent rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <GraduationCap size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-navy-900 mb-2 font-display">Create your account</h1>
          <p className="text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-royal-500 font-semibold hover:text-royal-600">Sign in</Link>
          </p>
        </div>

        <div className="card p-6 sm:p-8 backdrop-blur-xl shadow-card-hover border-royal-100/60">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-6 animate-fade-in">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-text-primary mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input id="name" type="text" value={form.name} onChange={e => handleChange('name', e.target.value)}
                  placeholder="Your full name" className="input pl-10" required />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-semibold text-text-primary mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input id="reg-email" type="email" value={form.email} onChange={e => handleChange('email', e.target.value)}
                  placeholder="you@example.com" className="input pl-10" required />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-text-primary mb-1.5">I am a</label>
              <select id="role" value={form.role} onChange={e => handleChange('role', e.target.value)} className="input">
                <option value="student">Student</option>
                <option value="faculty">Faculty Member</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-semibold text-text-primary mb-1.5">Department</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input id="department" type="text" value={form.department} onChange={e => handleChange('department', e.target.value)}
                  placeholder="e.g. Computer Science" className="input pl-10" />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-semibold text-text-primary mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input id="reg-password" type="password" value={form.password} onChange={e => handleChange('password', e.target.value)}
                  placeholder="At least 6 characters" className="input pl-10" required minLength={6} />
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-semibold text-text-primary mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input id="confirm-password" type="password" value={form.confirmPassword} onChange={e => handleChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password" className="input pl-10" required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full btn-lg font-bold disabled:opacity-50 mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">Create Account <ArrowRight size={16} /></span>
              )}
            </button>
          </form>

          <p className="mt-4 text-xs text-text-tertiary text-center">
            By creating an account, you agree to the privacy and responsible data use policies.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-text-tertiary">
          <Link to="/" className="hover:text-text-secondary">← Back to homepage</Link>
        </p>
      </div>
    </div>
  )
}
