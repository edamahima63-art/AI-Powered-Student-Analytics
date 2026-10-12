import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { studentApi } from '../../services/api'
import { RefreshCw, AlertTriangle } from 'lucide-react'
import { Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts'

function Skeleton({ className = '' }) {
  return <div className={`bg-border-subtle animate-pulse rounded-lg ${className}`}></div>
}

function gradeColor(marks) {
  if (marks >= 80) return '#14b8a6'
  if (marks >= 65) return '#2563eb'
  return '#ef4444'
}

export default function StudentSubjects() {
  const { user } = useAuth()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [sortBy, setSortBy]   = useState('marks')

  const fetch = async () => {
    setLoading(true); setError(null)
    try {
      const res = await studentApi.results()
      setData(res)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { if (user) fetch() }, [user?.id])

  if (loading) return (
    <div className="space-y-4 animate-fade-in">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      <Skeleton className="h-72" />
      <Skeleton className="h-64" />
    </div>
  )

  if (error) return (
    <div className="card p-8 text-center">
      <AlertTriangle size={28} className="text-red-500 mx-auto mb-2" />
      <p className="text-sm text-navy-900 font-semibold mb-3">{error}</p>
      <button onClick={fetch} className="btn btn-primary btn-sm"><RefreshCw size={14} />Retry</button>
    </div>
  )

  const results = data?.results || []
  if (!results.length) return (
    <div className="card p-10 text-center">
      <p className="text-sm text-text-secondary">No subject results available yet for your account.</p>
    </div>
  )

  const semester = data?.semester
  const semResults = results.filter(r => r.semester === semester)
  const avgMarks = semResults.length ? Math.round(semResults.reduce((s, r) => s + r.marks, 0) / semResults.length) : 0
  const strong = semResults.filter(r => r.marks >= 80)
  const weak   = semResults.filter(r => r.marks < 65)

  const radarData = semResults.map(r => ({ subject: r.code || r.subject.slice(0,6), marks: r.marks, target: r.target }))

  const sorted = [...semResults].sort((a, b) => {
    if (sortBy === 'marks')   return b.marks - a.marks
    if (sortBy === 'subject') return a.subject.localeCompare(b.subject)
    return (b.marks - b.target) - (a.marks - a.target)
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900">Subject Performance</h1>
        <p className="text-sm text-text-secondary mt-1">Semester {semester} · Your subject-wise academic results</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Average Marks', value: `${avgMarks}%`, color: 'text-navy-900' },
          { label: 'Strong Subjects (≥80)', value: strong.length, color: 'text-teal-600' },
          { label: 'Needs Attention (<65)', value: weak.length, color: weak.length > 0 ? 'text-red-500' : 'text-teal-600' },
          { label: 'Total Credits', value: semResults.reduce((s, r) => s + (r.credits || 3), 0), color: 'text-royal-600' },
        ].map((s, i) => (
          <div key={i} className="card p-4 text-center">
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-tertiary">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-bold text-navy-900 mb-4">Performance vs Target</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
            <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Radar name="Your Marks" dataKey="marks" stroke="#2563eb" fill="#2563eb" fillOpacity={0.15} strokeWidth={2} />
            <Radar name="Target" dataKey="target" stroke="#14b8a6" fill="none" strokeWidth={2} strokeDasharray="5 5" />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border-default">
          <h3 className="text-sm font-bold text-navy-900">All Subjects — Semester {semester}</h3>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="text-xs border border-border-default rounded-lg px-2 py-1.5 bg-white">
            <option value="marks">Sort by Marks</option>
            <option value="subject">Sort by Subject</option>
          </select>
        </div>
        <div className="table-container border-0 rounded-none">
          <table className="data-table">
            <thead><tr><th>Subject</th><th>Marks</th><th>Grade</th><th>Target</th><th>Teacher</th><th>Status</th></tr></thead>
            <tbody>
              {sorted.map((r, i) => {
                const met = r.marks >= r.target
                return (
                  <tr key={i}>
                    <td><div><p className="font-semibold text-navy-900">{r.subject}</p><p className="text-xs text-text-tertiary">{r.code}</p></div></td>
                    <td>
                      <span className="font-bold" style={{ color: gradeColor(r.marks) }}>{r.marks}</span>
                      <span className="text-text-tertiary">/{r.max}</span>
                    </td>
                    <td><span className="badge badge-info">{r.grade}</span></td>
                    <td className="text-text-secondary">{r.target}</td>
                    <td className="text-xs text-text-secondary">{r.teacher}</td>
                    <td><span className={`badge ${met ? 'badge-success' : 'badge-danger'}`}>{met ? 'On Target' : 'Below Target'}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-text-tertiary text-center">Your personal academic records from the database. Student: {user?.studentId}</p>
    </div>
  )
}
