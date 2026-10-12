import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { studentApi } from '../../services/api'
import {
  TrendingUp, TrendingDown, BookOpen, Clock, CheckCircle2, Award,
  Calendar, Target, BarChart3, AlertTriangle, ArrowRight, RefreshCw, Zap,
  Flame, Sparkles
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

// ─── Loading skeleton ────────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return <div className={`bg-border-subtle animate-pulse rounded-lg ${className}`}></div>
}

function StatCard({ icon: Icon, label, value, change, changeLabel, color, cardGradient, barPct, children }) {
  const isPositive = change >= 0
  return (
    <div className={`card p-5 group transition-all duration-200 hover:-translate-y-1 ${cardGradient || 'bg-white/90'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform ${color}`}>
          <Icon size={22} />
        </div>
        {change !== undefined && change !== 0 && (
          <span className={`badge ${isPositive ? 'badge-success' : 'badge-danger'}`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isPositive ? '+' : ''}{change}{changeLabel || ''}
          </span>
        )}
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight font-display">{value}</p>
      <p className="text-xs font-semibold text-text-secondary mt-1">{label}</p>
      {barPct !== undefined && (
        <div className="mt-3 progress-bar h-2 rounded-full bg-slate-200/70">
          <div className="progress-bar-fill h-2 rounded-full gradient-accent" style={{ width: `${Math.min(barPct, 100)}%` }}></div>
        </div>
      )}
      {children}
    </div>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyState({ message, studentId }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="card p-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-royal-50 flex items-center justify-center mx-auto mb-4">
          <BookOpen size={32} className="text-royal-500" />
        </div>
        <h3 className="text-lg font-bold text-navy-900 mb-2">No Academic Records Yet</h3>
        <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">{message}</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
          <AlertTriangle size={14} />
          Your records will appear here once your faculty enters them
        </div>
      </div>

      {/* Instructions for admin/faculty */}
      <div className="card p-6 border-l-4 border-royal-400">
        <h4 className="text-sm font-bold text-navy-900 mb-3">How to add academic records</h4>
        <div className="space-y-2 text-xs text-text-secondary">
          <p><span className="font-semibold text-navy-700">Faculty/Admin login:</span> Use the Faculty or Admin account and go to <span className="font-mono bg-surface-tertiary px-1 rounded">Dashboard → Data Management</span></p>
          <p><span className="font-semibold text-navy-700">Single entry:</span> Enter subject-wise marks and attendance for each student</p>
          <p><span className="font-semibold text-navy-700">Bulk import:</span> Upload a CSV with columns: <span className="font-mono bg-surface-tertiary px-1 rounded">student_email, subject, marks, max_marks, semester</span></p>
          <p className="text-[11px] text-text-tertiary pt-2 border-t border-border-subtle">
            Student ID: {studentId || 'Not assigned'} — share this with your faculty for data entry
          </p>
        </div>
      </div>
    </div>
  )
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await studentApi.dashboard()
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Refetch whenever the logged-in user changes — prevents stale data between accounts
  useEffect(() => {
    if (user) fetchDashboard()
  }, [user?.id])

  // ── Loading state ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  // ── Error state ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="card p-8 text-center">
        <AlertTriangle size={32} className="text-red-500 mx-auto mb-3" />
        <p className="text-sm font-semibold text-navy-900 mb-2">Failed to load dashboard</p>
        <p className="text-xs text-text-secondary mb-4">{error}</p>
        <button onClick={fetchDashboard} className="btn btn-primary btn-sm">
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    )
  }

  // ── Empty state ─────────────────────────────────────────────────────────
  if (!data?.hasData) {
    return <EmptyState
      message={data?.message || 'No academic records available yet. Your dashboard will update when your academic information is added.'}
      studentId={user?.studentId}
    />
  }

  const assignmentPct = data.assignmentsTotal > 0
    ? Math.round((data.assignmentsCompleted / data.assignmentsTotal) * 100)
    : 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Student Super Hero Header */}
      <div className="student-hero p-6 sm:p-8 text-white relative overflow-hidden">
        {/* Ambient glow orbs in the background */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-royal-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold badge-streak shadow-sm">
                <Flame size={13} className="text-orange-500 fill-orange-500" />
                5-Day Study Streak
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold badge-level shadow-sm">
                <Sparkles size={13} className="text-purple-500" />
                Active Scholar
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                data.riskLevel === 'High' 
                  ? 'bg-red-500/20 border border-red-500/40 text-red-200' 
                  : data.riskLevel === 'Medium' 
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200' 
                    : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-200'
              }`}>
                <AlertTriangle size={12} />
                {data.riskLevel} Academic Risk
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-teal-200">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              {data.currentSemester} · {user?.department || 'Computer Science'} · Student ID: <span className="font-mono text-indigo-300 font-semibold">{user?.studentId || 'CS2024'}</span>
            </p>
          </div>

          {/* Quick action buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchDashboard}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all backdrop-blur-md"
              title="Refresh live data"
            >
              <RefreshCw size={16} />
            </button>
            <Link
              to="/dashboard/quizzes"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
            >
              <Zap size={16} />
              Daily Quiz
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {/* KPI Cards with Signature Vibrant Gradients */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BarChart3}
          label="Overall GPA"
          value={data.gpa.toFixed(1)}
          change={data.gpaChange}
          cardGradient="bg-gradient-to-br from-blue-500/15 via-indigo-500/8 to-white/95 border-indigo-200/90 shadow-md shadow-indigo-500/5 hover:border-royal-500 hover:shadow-indigo-500/20"
          color="bg-gradient-to-br from-royal-500 to-indigo-600 text-white shadow-md shadow-royal-500/25"
          barPct={(data.gpa / 10) * 100}
        />
        <StatCard
          icon={Clock}
          label="Attendance"
          value={`${data.attendancePct}%`}
          cardGradient="bg-gradient-to-br from-teal-500/15 via-emerald-500/8 to-white/95 border-teal-200/90 shadow-md shadow-teal-500/5 hover:border-teal-500 hover:shadow-teal-500/20"
          color={`${data.attendancePct < 75 ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md shadow-red-500/25' : 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/25'}`}
        >
          <div className="mt-3 progress-bar h-2 rounded-full bg-slate-200/70">
            <div
              className={`progress-bar-fill h-2 rounded-full ${data.attendancePct < 75 ? 'bg-red-500' : 'bg-teal-500'}`}
              style={{ width: `${data.attendancePct}%` }}
            ></div>
          </div>
          {data.attendancePct < 75 && (
            <p className="text-[10px] text-red-500 font-semibold mt-1">⚠ Below eligibility threshold</p>
          )}
        </StatCard>
        <StatCard
          icon={CheckCircle2}
          label="Tasks Completed"
          value={`${data.assignmentsCompleted}/${data.assignmentsTotal}`}
          cardGradient="bg-gradient-to-br from-purple-500/15 via-violet-500/8 to-white/95 border-purple-200/90 shadow-md shadow-purple-500/5 hover:border-purple-500 hover:shadow-purple-500/20"
          color="bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-md shadow-purple-500/25"
        >
          <div className="mt-3 progress-bar h-2 rounded-full bg-slate-200/70">
            <div className="progress-bar-fill h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500" style={{ width: `${assignmentPct}%` }}></div>
          </div>
        </StatCard>
        <StatCard
          icon={Target}
          label="Overall Progress"
          value={`${data.overallProgress}%`}
          cardGradient="bg-gradient-to-br from-amber-500/15 via-orange-500/8 to-white/95 border-amber-200/90 shadow-md shadow-amber-500/5 hover:border-amber-500 hover:shadow-amber-500/20"
          color="bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25"
        >
          <div className="mt-3 progress-bar h-2 rounded-full bg-slate-200/70">
            <div className="progress-bar-fill h-2 rounded-full gradient-sunset" style={{ width: `${data.overallProgress}%` }}></div>
          </div>
        </StatCard>
      </div>

      {/* Quick Access: Subject Assessments & Quizzes Hub */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          to="/dashboard/assessments"
          className="card p-5 group bg-gradient-to-r from-blue-500/12 via-indigo-500/10 to-sky-500/10 border-indigo-200/90 hover:border-royal-500 hover:shadow-lg hover:shadow-royal-500/15 transition-all flex items-center justify-between hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-royal-500 via-indigo-600 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-royal-500/25 group-hover:scale-110 transition-transform">
              <Award size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-navy-900 group-hover:text-royal-600 transition-colors">
                  Subject Assessments
                </h3>
                <span className="badge bg-royal-100 text-royal-700 font-bold border border-royal-200 text-[10px]">Evaluations</span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5 font-medium">
                Submit assignments, view graded tests, and check instructor feedback.
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="text-royal-500 group-hover:translate-x-1.5 transition-all shrink-0 ml-2" />
        </Link>

        <Link
          to="/dashboard/quizzes"
          className="card p-5 group bg-gradient-to-r from-purple-500/12 via-pink-500/10 to-rose-500/10 border-purple-200/90 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/15 transition-all flex items-center justify-between hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-fuchsia-600 to-pink-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-500/25 group-hover:scale-110 transition-transform">
              <Zap size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-navy-900 group-hover:text-purple-600 transition-colors">
                  Subject Quizzes
                </h3>
                <span className="badge bg-purple-100 text-purple-700 font-bold border border-purple-200 text-[10px]">Interactive</span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5 font-medium">
                Practice timed subject questions with real-time scoring and concept explanations.
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="text-purple-500 group-hover:translate-x-1.5 transition-all shrink-0 ml-2" />
        </Link>
      </div>

      {/* Charts Row */}
      {data.performanceTrend?.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* GPA Trend */}
          <div className="card p-5 bg-gradient-to-br from-indigo-50/85 via-white/90 to-blue-50/75 border-indigo-200/90 shadow-md shadow-indigo-500/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-royal-500 animate-pulse"></span>
                <h3 className="text-sm font-extrabold text-navy-900 font-display">GPA Trend</h3>
              </div>
              <span className="badge badge-info text-[10px]">Academic Trajectory</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.performanceTrend}>
                <defs>
                  <linearGradient id="gpaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[4, 10]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #c7d2fe', fontSize: '12px', boxShadow: '0 4px 14px rgba(99,102,241,0.15)' }}
                  formatter={(val) => [Number(val).toFixed(1), 'GPA']}
                />
                <Area type="monotone" dataKey="gpa" stroke="#4f46e5" strokeWidth={3} fill="url(#gpaGrad)" dot={{ r: 4, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-[11px] text-text-tertiary mt-2">Monthly GPA calculated from your assessment scores</p>
          </div>

          {/* Subject Performance */}
          <div className="card p-5 bg-gradient-to-br from-teal-50/85 via-white/90 to-emerald-50/75 border-teal-200/90 shadow-md shadow-teal-500/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
                <h3 className="text-sm font-extrabold text-navy-900 font-display">Subject Performance</h3>
              </div>
              <span className="badge badge-success text-[10px]">Evaluated</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.subjectPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#ccfbf1" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="subject" type="category" width={110} tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #99f6e4', fontSize: '12px', boxShadow: '0 4px 14px rgba(20,184,166,0.15)' }}
                  formatter={(val) => [`${val}/100`, 'Marks']}
                />
                <Bar dataKey="marks" radius={[0, 6, 6, 0]} barSize={16}>
                  {data.subjectPerformance.map((entry, i) => (
                    <Cell key={i} fill={entry.marks >= 80 ? '#0d9488' : entry.marks >= 65 ? '#4f46e5' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[11px] text-text-tertiary mt-2">
              <span className="inline-block w-2 h-2 rounded-full bg-teal-600 mr-1"></span> ≥80
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 ml-3 mr-1"></span> ≥65
              <span className="inline-block w-2 h-2 rounded-full bg-red-500 ml-3 mr-1"></span> &lt;65
            </p>
          </div>
        </div>
      )}

      {/* Action Center + Upcoming */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Action Center */}
        <div className="lg:col-span-2 card p-5 bg-gradient-to-br from-purple-50/85 via-white/90 to-indigo-50/75 border-purple-200/90 shadow-md shadow-purple-500/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
              <h3 className="text-sm font-extrabold text-navy-900 font-display">Action Center</h3>
            </div>
            <span className="badge badge-purple font-bold">{data.actionItems?.length || 0} actions</span>
          </div>
          {data.actionItems?.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle2 size={28} className="text-teal-500 mx-auto mb-2" />
              <p className="text-sm text-text-secondary font-medium">Great work! All subjects are on target.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.actionItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/80 border border-purple-100/80 hover:border-purple-300 hover:bg-white transition-all shadow-xs">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                    item.priority === 'high' ? 'bg-red-500 animate-ping' : item.priority === 'medium' ? 'bg-amber-500' : 'bg-teal-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-navy-900">{item.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{item.reason}</p>
                  </div>
                  <span className={`badge text-[10px] ${
                    item.priority === 'high' ? 'badge-danger' : item.priority === 'medium' ? 'badge-warning' : 'badge-success'
                  }`}>
                    {item.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Activities */}
        <div className="card p-5 bg-gradient-to-br from-amber-50/85 via-white/90 to-orange-50/75 border-amber-200/90 shadow-md shadow-amber-500/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              <h3 className="text-sm font-extrabold text-navy-900 font-display">Upcoming Tasks</h3>
            </div>
            <span className="badge badge-warning text-[10px]">Planner</span>
          </div>
          {data.upcomingActivities?.length === 0 ? (
            <p className="text-sm text-text-tertiary">No upcoming tasks.</p>
          ) : (
            <div className="space-y-3">
              {data.upcomingActivities.map((act, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/80 border border-amber-100 hover:border-amber-300 transition-all shadow-xs">
                  <Calendar size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-navy-900">{act.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5 font-medium">{act.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Attendance Trend */}
      {data.attendanceTrend?.length > 0 && (
        <div className="card p-5 bg-gradient-to-br from-sky-50/85 via-white/90 to-teal-50/75 border-sky-200/90 shadow-md shadow-sky-500/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
              <h3 className="text-sm font-extrabold text-navy-900 font-display">Weekly Attendance</h3>
            </div>
            <span className="badge badge-info text-[10px]">75% Minimum Required</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.attendanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                formatter={(val) => [`${val}%`, 'Attendance']}
              />
              <Bar dataKey="pct" radius={[6, 6, 0, 0]} barSize={28}>
                {data.attendanceTrend.map((entry, i) => (
                  <Cell key={i} fill={entry.pct >= 85 ? '#14b8a6' : entry.pct >= 75 ? '#f59e0b' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-[11px] text-text-tertiary mt-2">
            Attendance from your class records. 75% minimum required for exam eligibility.
          </p>
        </div>
      )}

      <p className="text-xs text-text-tertiary text-center pb-4">
        Data retrieved from your personal academic records. Student ID: {user?.studentId}
      </p>
    </div>
  )
}
