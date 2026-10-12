import React from 'react'
import { Building2 } from 'lucide-react'
const DEPTS = [
  { name: 'Computer Science & Engineering', code: 'CSE', hod: 'Dr. Suresh Babu', students: 312, faculty: 24, avgGpa: 7.8, attendance: 87 },
  { name: 'Electronics & Communication', code: 'ECE', hod: 'Dr. Lakshmi Priya', students: 278, faculty: 20, avgGpa: 7.3, attendance: 83 },
  { name: 'Mechanical Engineering', code: 'MECH', hod: 'Dr. Ramesh Pillai', students: 245, faculty: 22, avgGpa: 6.9, attendance: 80 },
  { name: 'Civil Engineering', code: 'CIVIL', hod: 'Dr. Kavitha Menon', students: 198, faculty: 18, avgGpa: 7.2, attendance: 85 },
]
export default function AdminDepartments() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-extrabold text-navy-900">Departments</h1><p className="text-sm text-text-secondary mt-1">Manage academic departments</p></div>
      <div className="grid sm:grid-cols-2 gap-4">
        {DEPTS.map((d, i) => (
          <div key={i} className="card p-5 card-interactive">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 gradient-accent rounded-xl flex items-center justify-center shrink-0">
                <Building2 size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-navy-900">{d.name}</h3>
                <p className="text-xs text-text-tertiary">HoD: {d.hod}</p>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {[
                    { label: 'Students', value: d.students },
                    { label: 'Faculty', value: d.faculty },
                    { label: 'Avg GPA', value: d.avgGpa },
                    { label: 'Attendance', value: `${d.attendance}%` },
                  ].map((stat, j) => (
                    <div key={j} className="bg-surface-secondary rounded-lg p-2 text-center">
                      <p className="text-sm font-bold text-navy-900">{stat.value}</p>
                      <p className="text-[10px] text-text-tertiary">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
