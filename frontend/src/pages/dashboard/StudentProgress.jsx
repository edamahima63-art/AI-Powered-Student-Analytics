import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { studentApi } from '../../services/api'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function Skeleton({ className = '' }) {
  return <div className={`bg-border-subtle animate-pulse rounded-lg ${className}`}></div>
}

export default function StudentProgress() {
  const { user } = useAuth()
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [timeRange, setTimeRange] = useState('semester')

  const fetchData = async () => {
    setLoading(true); setError(null)
    try {
      const res = await studentApi.progress()
      setData(res)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { if (user) fetchData() }, [user?.id])

  if (loading) return (
    <div className="space-y-4 animate-fade-in">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-52" />
      <div className="grid lg:grid-cols-2 gap-6"><Skeleton className="h-64" /><Skeleton className="h-64" /></div>
    </div>
  )

  if (error) return (
    <div className="card p-8 text-center">
      <AlertTriangle size={28} className="text-red-500 mx-auto mb-2" />
      <p className="text-sm text-navy-900 font-semibold mb-3">{error}</p>
      <button onClick={fetchData} className="btn btn-primary btn-sm"><RefreshCw size={14} />Retry</button>
    </div>
  )

  const goals = data?.goals || []
  const semData = data?.semesterData || []
  const monthlyGpa = data?.monthlyGpa || []

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">Progress Tracking</h1>
          <p className="text-sm text-text-secondary mt-1">Your academic journey — calculated from your personal records</p>
        </div>
        <div className="flex gap-2">
          {['semester', 'monthly'].map(t => (
            <button key={t} onClick={() => setTimeRange(t)}
              className={`btn btn-sm ${timeRange === t ? 'btn-primary' : 'btn-ghost'}`}>
              {t === 'semester' ? 'Semester View' : 'Monthly View'}
            </button>
          ))}
        </div>
      </div>

      {/* Learning Goals */}
      {goals.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-bold text-navy-900 mb-4">Learning Goals</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {goals.map((g, i) => (
              <div key={i} className="p-4 rounded-xl bg-surface-secondary">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-navy-900">{g.goal}</p>
                  <span className={`badge ${g.pct >= 90 ? 'badge-success' : g.pct >= 70 ? 'badge-warning' : 'badge-danger'}`}>{g.pct}%</span>
                </div>
                <div className="progress-bar mb-1.5">
                  <div className={`progress-bar-fill ${g.pct >= 90 ? 'bg-teal-500' : g.pct >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${g.pct}%` }}></div>
                </div>
                <p className="text-xs text-text-tertiary">
                  Current: {g.current} {g.unit} · Target: {g.target} {g.unit}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {timeRange === 'semester' && semData.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="text-sm font-bold text-navy-900 mb-4">GPA Across Semesters</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={semData}>
                <defs>
                  <linearGradient id="gpaGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="sem" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[4, 10]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Area type="monotone" dataKey="gpa" stroke="#2563eb" strokeWidth={2.5} fill="url(#gpaGrad2)" dot={{ r: 5, fill: '#2563eb' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-bold text-navy-900 mb-4">Attendance by Semester</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={semData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="sem" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Bar dataKey="attendance" name="Attendance %" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {timeRange === 'monthly' && monthlyGpa.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-bold text-navy-900 mb-4">Monthly GPA Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyGpa}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[4, 10]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Line type="monotone" dataKey="gpa" name="GPA" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {semData.length === 0 && monthlyGpa.length === 0 && (
        <div className="card p-10 text-center">
          <p className="text-sm text-text-secondary">No progress data available yet.</p>
        </div>
      )}

      <p className="text-xs text-text-tertiary text-center">Data from your personal academic records. Student: {user?.studentId}</p>
    </div>
  )
}
