import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Eye } from 'lucide-react'
import { manageApi } from '../../services/api'

export default function AdminStudents() {
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
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = students.filter(s =>
    (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.studentCode || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleReview = (email) => {
    navigate(`/dashboard/admin/data?student=${encodeURIComponent(email)}`)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">Students</h1>
          <p className="text-sm text-text-secondary mt-1">Manage and review all enrolled students</p>
        </div>
      </div>
      <div className="card p-4">
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students..."
            className="input pl-10 w-full"
          />
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Department</th>
                <th>Semester</th>
                <th>Avg Marks</th>
                <th>Subjects</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id || i} className="hover:bg-surface-secondary/70 transition-colors">
                  <td>
                    <div>
                      <p className="font-semibold text-navy-900">{s.name}</p>
                      <p className="text-xs text-text-tertiary">{s.studentCode || s.email}</p>
                    </div>
                  </td>
                  <td>{s.department || 'General'}</td>
                  <td>Sem {s.semester || 1}</td>
                  <td className="font-bold text-navy-900">
                    {s.avgMarks !== null && s.avgMarks !== undefined ? `${s.avgMarks}%` : '—'}
                  </td>
                  <td>
                    <span className="badge badge-info">{s.subjectCount || 0} subjects</span>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => handleReview(s.email)}
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
        <p className="text-xs text-text-tertiary mt-3">Showing {filtered.length} of {students.length} students</p>
      </div>
    </div>
  )
}
