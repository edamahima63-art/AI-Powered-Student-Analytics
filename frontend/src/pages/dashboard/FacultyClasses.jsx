import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Eye, Users } from 'lucide-react'
import { manageApi } from '../../services/api'

export default function FacultyClasses() {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStudents()
  }, [])

  async function loadStudents() {
    try {
      const data = await manageApi.listStudents()
      setStudents(data.students || [])
    } catch {
      // Fallback demo students if network error
      setStudents([
        { id: '1', name: 'Ananya Patel', email: 'studenta@eduinsight.com', department: 'Computer Science', semester: 4, studentCode: 'STU-2024-0042', avgMarks: 83.2 },
        { id: '2', name: 'Ravi Mehta', email: 'studentb@eduinsight.com', department: 'ECE', semester: 3, studentCode: 'STU-2024-0043', avgMarks: 65.0 },
        { id: '3', name: 'mahima', email: 'edamahima63@gmail.com', department: 'Computer Science', semester: 1, studentCode: 'CS2024-001', avgMarks: 82.5 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const filtered = students.filter(s =>
    (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.studentCode || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleReviewStudent = (email) => {
    navigate(`/dashboard/faculty/data?student=${encodeURIComponent(email)}`)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">My Classes & Students</h1>
          <p className="text-sm text-text-secondary mt-1">Review student performance and manage academic records</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students by name, email, roll no..."
            className="input pl-10 w-full"
          />
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Dept</th>
                <th>Semester</th>
                <th>Avg Marks</th>
                <th>Subjects</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-text-tertiary text-xs">
                    No students found.
                  </td>
                </tr>
              ) : filtered.map((s, i) => (
                <tr key={s.id || i} className="hover:bg-surface-secondary/70 transition-colors">
                  <td>
                    <div>
                      <p className="font-semibold text-navy-900">{s.name}</p>
                      <p className="text-xs text-text-tertiary font-mono">{s.studentCode || s.email}</p>
                    </div>
                  </td>
                  <td>{s.department || 'General'}</td>
                  <td>Sem {s.semester || 1}</td>
                  <td className="font-bold text-navy-900">
                    {s.avgMarks !== null && s.avgMarks !== undefined ? `${s.avgMarks}%` : '—'}
                  </td>
                  <td>
                    <span className="badge badge-info text-xs font-semibold">
                      {s.subjectCount || 0} subjects
                    </span>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => handleReviewStudent(s.email)}
                      className="btn btn-primary btn-sm gap-1.5"
                    >
                      <Eye size={14} /> Review Student
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
