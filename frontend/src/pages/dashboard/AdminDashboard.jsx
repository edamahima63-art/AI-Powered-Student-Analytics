import React from 'react'
import { BarChart3, Users, GraduationCap, AlertTriangle, Building2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts'

const DEPT_DATA = [
  { dept: 'CSE', students: 312, avgGpa: 7.8, highRisk: 28, attendance: 87 },
  { dept: 'ECE', students: 278, avgGpa: 7.3, highRisk: 41, attendance: 83 },
  { dept: 'MECH', students: 245, avgGpa: 6.9, highRisk: 52, attendance: 80 },
  { dept: 'CIVIL', students: 198, avgGpa: 7.2, highRisk: 35, attendance: 85 },
]

const RISK_DATA = [
  { name: 'Low Risk', value: 62, fill: '#14b8a6' },
  { name: 'Medium Risk', value: 27, fill: '#f59e0b' },
  { name: 'High Risk', value: 11, fill: '#ef4444' },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900">Institutional Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">Dr. Priya Sharma · Administrator · Academic Year 2026</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: '1,033', icon: GraduationCap, color: 'bg-royal-50 text-royal-600', sub: '↑42 this year' },
          { label: 'Faculty Members', value: '87', icon: Users, color: 'bg-teal-50 text-teal-600', sub: '4 departments' },
          { label: 'High-Risk Students', value: '156', icon: AlertTriangle, color: 'bg-red-50 text-red-500', sub: '11% of enrollment' },
          { label: 'Institution GPA', value: '7.4', icon: BarChart3, color: 'bg-lavender-50 text-lavender-600', sub: '↑0.2 from last sem' },
        ].map((stat, i) => (
          <div key={i} className="card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <p className="text-2xl font-extrabold text-navy-900">{stat.value}</p>
            <p className="text-xs text-text-tertiary">{stat.label}</p>
            <p className={`text-xs font-semibold mt-1 ${stat.color.includes('red') ? 'text-red-500' : 'text-teal-600'}`}>{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <div className="card p-5">
          <h3 className="text-sm font-bold text-navy-900 mb-4">Department Performance</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={DEPT_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[6, 9]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Bar dataKey="avgGpa" name="Avg GPA" radius={[6,6,0,0]} barSize={36}>
                {DEPT_DATA.map((_, i) => (
                  <Cell key={i} fill={['#2563eb','#14b8a6','#8b5cf6','#f59e0b'][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution */}
        <div className="card p-5">
          <h3 className="text-sm font-bold text-navy-900 mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={RISK_DATA} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}%`} labelLine={false}>
                {RISK_DATA.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} formatter={(v) => [`${v}%`]} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-border-default">
          <h3 className="text-sm font-bold text-navy-900">Department Summary</h3>
        </div>
        <div className="table-container border-0 rounded-none">
          <table className="data-table">
            <thead><tr><th>Department</th><th>Students</th><th>Avg GPA</th><th>Attendance</th><th>High Risk</th><th>Status</th></tr></thead>
            <tbody>
              {DEPT_DATA.map((d, i) => (
                <tr key={i}>
                  <td><div className="flex items-center gap-2"><Building2 size={16} className="text-text-tertiary" /><span className="font-semibold text-navy-900">{d.dept}</span></div></td>
                  <td>{d.students}</td>
                  <td className="font-bold text-navy-900">{d.avgGpa}</td>
                  <td>{d.attendance}%</td>
                  <td><span className="badge badge-danger">{d.highRisk}</span></td>
                  <td><span className={`badge ${d.avgGpa >= 7.5 ? 'badge-success' : d.avgGpa >= 7.0 ? 'badge-warning' : 'badge-danger'}`}>{d.avgGpa >= 7.5 ? 'Good' : d.avgGpa >= 7.0 ? 'Fair' : 'Needs Attention'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-text-tertiary text-center">Demo institutional data. Connect backend to see live figures.</p>
    </div>
  )
}
