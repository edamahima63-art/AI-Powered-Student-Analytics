import React from 'react'
import { FileText, Download } from 'lucide-react'
const REPORTS = [
  { name: 'Semester 4 Performance Report', type: 'Academic', date: 'Oct 11, 2026', size: '2.4 MB' },
  { name: 'Monthly Attendance Summary — September 2026', type: 'Attendance', date: 'Oct 1, 2026', size: '1.1 MB' },
  { name: 'High-Risk Student Intervention Tracker', type: 'Intervention', date: 'Oct 9, 2026', size: '0.8 MB' },
  { name: 'Department Comparison — Q3 2026', type: 'Analytics', date: 'Oct 5, 2026', size: '3.2 MB' },
  { name: 'Faculty Workload & Student Distribution', type: 'Management', date: 'Sep 30, 2026', size: '0.6 MB' },
]
export default function AdminReports() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-extrabold text-navy-900">Reports</h1><p className="text-sm text-text-secondary mt-1">Generate and download institutional reports</p></div>
      <div className="card p-5">
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Report Type', options: ['All Types', 'Academic', 'Attendance', 'Intervention', 'Analytics'] },
            { label: 'Department', options: ['All Departments', 'CSE', 'ECE', 'MECH', 'CIVIL'] },
            { label: 'Period', options: ['All Periods', 'This Month', 'Last Month', 'This Semester'] },
          ].map((f, i) => (
            <div key={i}><label className="block text-xs font-semibold text-text-secondary mb-1">{f.label}</label>
              <select className="input">{f.options.map(o => <option key={o}>{o}</option>)}</select></div>
          ))}
        </div>
        <div className="space-y-2">
          {REPORTS.map((r, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-surface-secondary hover:bg-surface-tertiary transition-colors">
              <FileText size={18} className="text-royal-500 shrink-0" />
              <div className="flex-1"><p className="text-sm font-semibold text-navy-900">{r.name}</p>
                <p className="text-xs text-text-tertiary">{r.type} · {r.date} · {r.size}</p></div>
              <button className="btn btn-sm btn-ghost"><Download size={14} />Export</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
