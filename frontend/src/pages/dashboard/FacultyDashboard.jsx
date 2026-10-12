import React from 'react'
import { LayoutDashboard, Users, BarChart3, AlertTriangle } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const DEPT_PERFORMANCE = [
  { dept: 'CSE', avg: 78, attendance: 87, highRisk: 8 },
  { dept: 'ECE', avg: 72, attendance: 83, highRisk: 12 },
  { dept: 'MECH', avg: 69, attendance: 80, highRisk: 15 },
  { dept: 'CIVIL', avg: 74, attendance: 85, highRisk: 9 },
]

const TREND = [
  { week: 'W1', avg: 71 }, { week: 'W2', avg: 73 }, { week: 'W3', avg: 72 },
  { week: 'W4', avg: 75 }, { week: 'W5', avg: 74 }, { week: 'W6', avg: 77 },
]

const ALERTS = [
  { name: 'Ravi M.', dept: 'ECE', issue: 'Attendance dropped to 58%', priority: 'high' },
  { name: 'Priya S.', dept: 'MECH', issue: 'Marks declined 22% this month', priority: 'high' },
  { name: 'Ankit K.', dept: 'CIVIL', issue: 'Missing 3 consecutive assignments', priority: 'medium' },
  { name: 'Sneha R.', dept: 'CSE', issue: 'LMS inactive for 10 days', priority: 'medium' },
]

export default function FacultyDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900">Faculty Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">Prof. Rajesh Kumar · Computer Science · Academic Year 2026</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'My Classes', value: '4', icon: LayoutDashboard, color: 'bg-royal-50 text-royal-600' },
          { label: 'Total Students', value: '142', icon: Users, color: 'bg-teal-50 text-teal-600' },
          { label: 'High-Risk Students', value: '12', icon: AlertTriangle, color: 'bg-red-50 text-red-500' },
          { label: 'Avg Class Score', value: '74%', icon: BarChart3, color: 'bg-lavender-50 text-lavender-600' },
        ].map((stat, i) => (
          <div key={i} className="card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <p className="text-2xl font-extrabold text-navy-900">{stat.value}</p>
            <p className="text-xs text-text-tertiary">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="text-sm font-bold text-navy-900 mb-4">Class Average Trend (This Semester)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={TREND}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 90]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Area type="monotone" dataKey="avg" stroke="#14b8a6" strokeWidth={2.5} fill="url(#trendGrad)" dot={{ r: 4, fill: '#14b8a6' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-bold text-navy-900 mb-4">Department Performance Comparison</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={DEPT_PERFORMANCE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 90]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Bar dataKey="avg" name="Avg Score" radius={[6, 6, 0, 0]} barSize={30}>
                {DEPT_PERFORMANCE.map((_, i) => (
                  <Cell key={i} fill={['#2563eb', '#14b8a6', '#8b5cf6', '#f59e0b'][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Early Warning Alerts */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-navy-900">Early Warning Alerts</h3>
          <span className="badge badge-danger">{ALERTS.length} active</span>
        </div>
        <div className="space-y-3">
          {ALERTS.map((a, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-surface-secondary hover:bg-surface-tertiary transition-colors">
              <div className={`w-2 h-2 rounded-full shrink-0 ${a.priority === 'high' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-navy-900">{a.name} <span className="text-text-tertiary font-normal">· {a.dept}</span></p>
                <p className="text-xs text-text-secondary">{a.issue}</p>
              </div>
              <span className={`badge ${a.priority === 'high' ? 'badge-danger' : 'badge-warning'}`}>{a.priority}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-text-tertiary text-center">Demo data shown for evaluation. Connect backend for live records.</p>
    </div>
  )
}
