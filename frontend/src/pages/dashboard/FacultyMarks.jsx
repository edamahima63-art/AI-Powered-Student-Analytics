import React, { useState } from 'react'
import { Save } from 'lucide-react'

const STUDENTS = [
  { id: 'STU-001', name: 'Ananya Patel', rollNo: 'CS21001' },
  { id: 'STU-004', name: 'Arjun Kumar', rollNo: 'CS21004' },
  { id: 'STU-006', name: 'Vikram Singh', rollNo: 'EC21006' },
  { id: 'STU-007', name: 'Meera Iyer', rollNo: 'CS21007' },
]

export default function FacultyMarks() {
  const [subject, setSubject] = useState('Data Structures')
  const [assessment, setAssessment] = useState('Mid-Term')
  const [maxMarks, setMaxMarks] = useState(100)
  const [marks, setMarks] = useState(Object.fromEntries(STUDENTS.map(s => [s.id, ''])))
  const [saved, setSaved] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900">Enter Assessment Marks</h1>
        <p className="text-sm text-text-secondary mt-1">Record marks for internal assessments and exams</p>
      </div>
      <form onSubmit={handleSave} className="card p-5 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Subject</label>
            <select value={subject} onChange={e => setSubject(e.target.value)} className="input">
              <option>Data Structures</option><option>Algorithms</option><option>Database Systems</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Assessment Type</label>
            <select value={assessment} onChange={e => setAssessment(e.target.value)} className="input">
              <option>Mid-Term</option><option>End-Term</option><option>Internal 1</option><option>Internal 2</option><option>Assignment</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Max Marks</label>
            <input type="number" value={maxMarks} min={1} max={200} onChange={e => setMaxMarks(+e.target.value)} className="input" />
          </div>
        </div>
        <div className="space-y-2">
          {STUDENTS.map(s => (
            <div key={s.id} className="flex items-center gap-4 p-3 rounded-lg bg-surface-secondary">
              <div className="flex-1">
                <p className="text-sm font-semibold text-navy-900">{s.name}</p>
                <p className="text-xs text-text-tertiary">{s.rollNo}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number" min={0} max={maxMarks}
                  value={marks[s.id]}
                  onChange={e => setMarks(prev => ({ ...prev, [s.id]: e.target.value }))}
                  placeholder="—"
                  className="input w-24 text-center"
                />
                <span className="text-sm text-text-tertiary">/ {maxMarks}</span>
              </div>
            </div>
          ))}
        </div>
        <button type="submit" className={`btn w-full ${saved ? 'bg-teal-500 text-white' : 'btn-primary'}`}>
          <Save size={16} /> {saved ? 'Marks Saved!' : 'Save Marks'}
        </button>
      </form>
    </div>
  )
}
