import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { studentApi } from '../../services/api'
import { CheckCircle2, Clock, Lightbulb, AlertTriangle, RefreshCw } from 'lucide-react'

function Skeleton({ className = '' }) {
  return <div className={`bg-border-subtle animate-pulse rounded-lg ${className}`}></div>
}

export default function StudentRecommendations() {
  const { user } = useAuth()
  const [recs, setRecs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [filter, setFilter]   = useState('all')

  const fetchRecs = async () => {
    setLoading(true); setError(null)
    try {
      const res = await studentApi.recommendations()
      setRecs(res.recommendations || [])
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { if (user) fetchRecs() }, [user?.id])

  const toggleComplete = async (id, current) => {
    try {
      const updated = await studentApi.updateRecommendation(id, { completed: !current })
      setRecs(prev => prev.map(r => r.id === id ? { ...r, completed: updated.completed } : r))
    } catch (e) { console.error(e) }
  }

  if (loading) return (
    <div className="space-y-4 animate-fade-in">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-20" />
      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40" />)}
    </div>
  )

  if (error) return (
    <div className="card p-8 text-center">
      <AlertTriangle size={28} className="text-red-500 mx-auto mb-2" />
      <p className="text-sm font-semibold text-navy-900 mb-3">{error}</p>
      <button onClick={fetchRecs} className="btn btn-primary btn-sm"><RefreshCw size={14} />Retry</button>
    </div>
  )

  const filtered = recs.filter(r => {
    if (filter === 'pending')   return !r.completed
    if (filter === 'completed') return r.completed
    return true
  })
  const pendingCount = recs.filter(r => !r.completed).length

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900">Recommendations</h1>
        <p className="text-sm text-text-secondary mt-1">
          Personalized actions based on <strong>{user?.name}'s</strong> academic records · {pendingCount} pending
        </p>
      </div>

      <div className="card p-4 bg-lavender-50 border-lavender-200">
        <div className="flex items-start gap-3">
          <Lightbulb size={18} className="text-lavender-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-lavender-800">How these recommendations are generated</p>
            <p className="text-xs text-lavender-600 mt-1">
              These are rule-based recommendations generated from <strong>{user?.name}'s</strong> subject marks, attendance, and assignment completion. Each recommendation shows its supporting indicator so you can verify the reasoning. They are stored in the database and remain unchanged until your academic records change.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {[
          { key: 'all',       label: `All (${recs.length})` },
          { key: 'pending',   label: `Pending (${pendingCount})` },
          { key: 'completed', label: `Completed (${recs.length - pendingCount})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`btn btn-sm ${filter === f.key ? 'btn-primary' : 'btn-ghost'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <CheckCircle2 size={32} className="text-teal-500 mx-auto mb-3" />
          <p className="text-sm text-text-secondary">
            {filter === 'pending' ? 'All recommendations completed! Great work.' : 'No recommendations available yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(rec => (
            <div key={rec.id} className={`card p-5 transition-all ${rec.completed ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-4">
                <button onClick={() => toggleComplete(rec.id, rec.completed)} className="mt-0.5 shrink-0">
                  {rec.completed ? (
                    <CheckCircle2 size={22} className="text-teal-500" />
                  ) : (
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      rec.priority === 'high' ? 'border-red-400' : rec.priority === 'medium' ? 'border-amber-400' : 'border-teal-400'
                    }`}></div>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className={`text-sm font-bold ${rec.completed ? 'line-through text-text-tertiary' : 'text-navy-900'}`}>
                      {rec.title}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`badge text-[10px] ${
                        rec.priority === 'high' ? 'badge-danger' : rec.priority === 'medium' ? 'badge-warning' : 'badge-success'
                      }`}>{rec.priority}</span>
                      <span className="badge badge-purple text-[10px]">{rec.category}</span>
                    </div>
                  </div>

                  <p className="text-sm text-text-secondary mt-2">{rec.explanation}</p>

                  {rec.indicator && (
                    <div className="mt-3 p-3 rounded-lg bg-surface-secondary">
                      <p className="text-xs font-semibold text-text-secondary mb-1">Supporting Indicator</p>
                      <p className="text-xs text-navy-700">{rec.indicator}</p>
                    </div>
                  )}

                  {rec.action && (
                    <div className="mt-3 p-3 rounded-lg bg-royal-50 border border-royal-100">
                      <p className="text-xs font-semibold text-royal-700 mb-1">Suggested Action</p>
                      <p className="text-xs text-royal-600">{rec.action}</p>
                    </div>
                  )}

                  <p className="text-[11px] text-text-tertiary mt-3">
                    <Clock size={10} className="inline mr-1" />
                    {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
