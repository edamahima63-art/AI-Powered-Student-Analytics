import React from 'react'
import { AlertTriangle } from 'lucide-react'

const ALERTS = [
  { student: 'Ravi Mehta', dept: 'ECE', issue: 'Attendance dropped to 58% — below eligibility threshold', severity: 'High', date: 'Oct 11, 2026' },
  { student: 'Priya Sharma', dept: 'MECH', issue: 'Internal marks declined by 22% since last assessment', severity: 'High', date: 'Oct 10, 2026' },
  { student: 'Sneha Rao', dept: 'CIVIL', issue: 'Missing 3 consecutive assignments this semester', severity: 'Medium', date: 'Oct 9, 2026' },
  { student: 'Ankit Roy', dept: 'CSE', issue: 'LMS login frequency dropped from 18 to 4 per week', severity: 'Medium', date: 'Oct 8, 2026' },
]

export default function FacultyAlerts() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900">Early Warning Alerts</h1>
        <p className="text-sm text-text-secondary mt-1">Students who may benefit from additional academic support</p>
      </div>
      <div className="card p-4 bg-amber-50 border-amber-200">
        <p className="text-xs text-amber-700">
          <strong>Important:</strong> These alerts are informational and require faculty review. No action is taken automatically. Please discuss with students before escalating.
        </p>
      </div>
      <div className="space-y-3">
        {ALERTS.map((a, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className={`shrink-0 mt-0.5 ${a.severity === 'High' ? 'text-red-500' : 'text-amber-500'}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-navy-900">{a.student} <span className="font-normal text-text-tertiary">· {a.dept}</span></p>
                  <span className={`badge ${a.severity === 'High' ? 'badge-danger' : 'badge-warning'}`}>{a.severity}</span>
                </div>
                <p className="text-sm text-text-secondary mt-1">{a.issue}</p>
                <p className="text-xs text-text-tertiary mt-2">{a.date}</p>
                <div className="flex gap-2 mt-3">
                  <button className="btn btn-sm btn-primary">Record Support Action</button>
                  <button className="btn btn-sm btn-ghost">Dismiss</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
