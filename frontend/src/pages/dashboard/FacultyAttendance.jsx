import React, { useState } from 'react'
import { CheckCircle2, X, Save } from 'lucide-react'

const CLASS_STUDENTS = [
  { id: 'STU-001', name: 'Ananya Patel', rollNo: 'CS21001' },
  { id: 'STU-004', name: 'Arjun Kumar', rollNo: 'CS21004' },
  { id: 'STU-006', name: 'Vikram Singh', rollNo: 'EC21006' },
  { id: 'STU-007', name: 'Meera Iyer', rollNo: 'CS21007' },
  { id: 'STU-008', name: 'Rohan Das', rollNo: 'CS21008' },
]

export default function FacultyAttendance() {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [subject, setSubject] = useState('Data Structures')
  const [attendance, setAttendance] = useState(
    Object.fromEntries(CLASS_STUDENTS.map(s => [s.id, true]))
  )
  const [saved, setSaved] = useState(false)

  const toggle = (id) => setAttendance(prev => ({ ...prev, [id]: !prev[id] }))
  const presentCount = Object.values(attendance).filter(Boolean).length

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900">Record Attendance</h1>
        <p className="text-sm text-text-secondary mt-1">Mark attendance for your class sessions</p>
      </div>
      <div className="card p-5">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Subject</label>
            <select value={subject} onChange={e => setSubject(e.target.value)} className="input">
              <option>Data Structures</option>
              <option>Algorithms</option>
              <option>Database Systems</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-navy-900">Students ({CLASS_STUDENTS.length})</p>
          <span className="badge badge-success">{presentCount}/{CLASS_STUDENTS.length} Present</span>
        </div>

        <div className="space-y-2">
          {CLASS_STUDENTS.map(s => (
            <div key={s.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer
              ${attendance[s.id] ? 'bg-teal-50 border-teal-200' : 'bg-red-50 border-red-200'}`}
              onClick={() => toggle(s.id)}>
              {attendance[s.id]
                ? <CheckCircle2 size={20} className="text-teal-500 shrink-0" />
                : <X size={20} className="text-red-400 shrink-0" />}
              <div className="flex-1">
                <p className="text-sm font-semibold text-navy-900">{s.name}</p>
                <p className="text-xs text-text-tertiary">{s.rollNo}</p>
              </div>
              <span className={`badge ${attendance[s.id] ? 'badge-success' : 'badge-danger'}`}>
                {attendance[s.id] ? 'Present' : 'Absent'}
              </span>
            </div>
          ))}
        </div>

        <button onClick={handleSave} className={`btn w-full mt-5 ${saved ? 'bg-teal-500 text-white' : 'btn-primary'}`}>
          <Save size={16} />
          {saved ? 'Attendance Saved!' : 'Save Attendance'}
        </button>
        {saved && <p className="text-xs text-teal-600 text-center mt-2">Demo: In production, this updates the database.</p>}
      </div>
    </div>
  )
}
