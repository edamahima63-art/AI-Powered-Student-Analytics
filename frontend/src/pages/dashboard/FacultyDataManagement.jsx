import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Users, BookOpen, Calendar, Upload, Plus, Trash2, CheckCircle2,
  AlertTriangle, Search, RefreshCw, FileText, BarChart3,
  X, Save, Edit3, ShieldAlert, Award, GraduationCap, Eye, ArrowLeft, Loader2
} from 'lucide-react'
import { manageApi } from '../../services/api'

const API = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

// ─── Reusable Toast Notification ──────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  if (!msg) return null
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold animate-slide-up
      ${type === 'success' ? 'bg-teal-600 text-white' : 'bg-red-600 text-white'}`}>
      {type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
      <span>{msg}</span>
      <button onClick={onClose} className="ml-2 opacity-75 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </div>
  )
}

function SectionCard({ title, icon: Icon, iconColor = 'text-royal-600', iconBg = 'bg-royal-50', actions, children }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
            <Icon size={18} className={iconColor} />
          </div>
          <h3 className="text-sm font-bold text-navy-900">{title}</h3>
        </div>
        {actions && <div>{actions}</div>}
      </div>
      {children}
    </div>
  )
}

// ─── Edit Subject Marks Modal ────────────────────────────────────────────────
function EditMarksModal({ result, onClose, onSave }) {
  const [form, setForm] = useState({
    subject: result.subject || '',
    code: result.code || '',
    marks: result.marks !== undefined ? result.marks : '',
    max_marks: result.maxMarks || result.max_marks || 100,
    semester: result.semester || 1,
    credits: result.credits || 3,
    teacher: result.teacher || '',
    target: result.target || 75,
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(result.id, {
        ...form,
        marks: parseFloat(form.marks),
        max_marks: parseFloat(form.max_marks),
        semester: parseInt(form.semester),
        credits: parseInt(form.credits),
        target: parseFloat(form.target),
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 backdrop-blur-sm p-4">
      <div className="card max-w-lg w-full p-6 animate-scale-in">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-border-light">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-royal-50 text-royal-600 flex items-center justify-center">
              <Edit3 size={16} />
            </div>
            <div>
              <h3 className="font-bold text-navy-900 text-sm">Edit Subject Marks</h3>
              <p className="text-xs text-text-tertiary">Update previous results for {result.subject}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-secondary text-text-tertiary">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Subject Name *</label>
              <input
                className="input"
                required
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Subject Code</label>
              <input
                className="input"
                placeholder="CS301"
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Teacher</label>
              <input
                className="input"
                placeholder="Prof. Name"
                value={form.teacher}
                onChange={e => setForm(f => ({ ...f, teacher: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Marks Obtained *</label>
              <input
                className="input"
                type="number"
                step="0.5"
                min="0"
                max="200"
                required
                value={form.marks}
                onChange={e => setForm(f => ({ ...f, marks: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Max Marks *</label>
              <input
                className="input"
                type="number"
                step="0.5"
                min="1"
                required
                value={form.max_marks}
                onChange={e => setForm(f => ({ ...f, max_marks: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Semester *</label>
              <select
                className="input"
                value={form.semester}
                onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                  <option key={n} value={n}>Semester {n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Credits</label>
              <input
                className="input"
                type="number"
                min="1"
                max="8"
                value={form.credits}
                onChange={e => setForm(f => ({ ...f, credits: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <label className="label">Target Marks (%)</label>
              <input
                className="input"
                type="number"
                step="0.5"
                value={form.target}
                onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-light">
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm gap-1.5" disabled={saving}>
              <Save size={14} />
              {saving ? 'Saving...' : 'Save Updates'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Edit Attendance Modal ───────────────────────────────────────────────────
function EditAttendanceModal({ record, onClose, onSave }) {
  const [form, setForm] = useState({
    week_label: record.week || record.week_label || '',
    pct: record.pct !== undefined ? record.pct : '',
    semester: record.semester || 1,
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(record.id, {
        week_label: form.week_label,
        pct: parseFloat(form.pct),
        semester: parseInt(form.semester),
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 backdrop-blur-sm p-4">
      <div className="card max-w-sm w-full p-6 animate-scale-in">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-light">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Edit3 size={16} />
            </div>
            <div>
              <h3 className="font-bold text-navy-900 text-sm">Edit Attendance</h3>
              <p className="text-xs text-text-tertiary">{form.week_label || 'Weekly record'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-secondary text-text-tertiary">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label">Week Label *</label>
            <input
              className="input"
              required
              value={form.week_label}
              onChange={e => setForm(f => ({ ...f, week_label: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Attendance % *</label>
            <input
              className="input"
              type="number"
              min="0"
              max="100"
              step="0.5"
              required
              value={form.pct}
              onChange={e => setForm(f => ({ ...f, pct: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Semester *</label>
            <select
              className="input"
              value={form.semester}
              onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <option key={n} value={n}>Semester {n}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-light">
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm gap-1.5" disabled={saving}>
              <Save size={14} />
              {saving ? 'Saving...' : 'Save Updates'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Edit Student Profile Modal ──────────────────────────────────────────────
function EditProfileModal({ student, onClose, onSave }) {
  const [form, setForm] = useState({
    name: student.name || '',
    department: student.department || '',
    semester: student.semester || 1,
    student_code: student.studentCode || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        name: form.name,
        department: form.department,
        semester: parseInt(form.semester),
        student_code: form.student_code,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 backdrop-blur-sm p-4">
      <div className="card max-w-md w-full p-6 animate-scale-in">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-light">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-royal-50 text-royal-600 flex items-center justify-center">
              <GraduationCap size={16} />
            </div>
            <div>
              <h3 className="font-bold text-navy-900 text-sm">Edit Student Profile</h3>
              <p className="text-xs text-text-tertiary">{student.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-secondary text-text-tertiary">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label">Student Name *</label>
            <input
              className="input"
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Student ID / Roll No</label>
            <input
              className="input"
              placeholder="e.g. CS2024-001"
              value={form.student_code}
              onChange={e => setForm(f => ({ ...f, student_code: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Department</label>
            <input
              className="input"
              placeholder="Computer Science & Engineering"
              value={form.department}
              onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Current Semester *</label>
            <select
              className="input"
              value={form.semester}
              onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <option key={n} value={n}>Semester {n}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-light">
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm gap-1.5" disabled={saving}>
              <Save size={14} />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function FacultyDataManagement() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [students, setStudents] = useState([])
  const [selectedEmail, setSelectedEmail] = useState('')
  const [records, setRecords] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState('review')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [editingMarksModal, setEditingMarksModal] = useState(null)
  const [editingAttendanceModal, setEditingAttendanceModal] = useState(null)
  const [editingProfileModal, setEditingProfileModal] = useState(false)

  // In-form editing states
  const [editingMarksId, setEditingMarksId] = useState(null)
  const [editingAttId, setEditingAttId] = useState(null)
  const [editingRecId, setEditingRecId] = useState(null)

  // Forms
  const [marksForm, setMarksForm] = useState({
    subject: '', code: '', marks: '', max_marks: '100',
    semester: '1', credits: '3', teacher: '', target: '75'
  })
  const [attForm, setAttForm] = useState({ week_label: '', pct: '', semester: '1' })
  const [recForm, setRecForm] = useState({ title: '', explanation: '', action: '', priority: 'medium', category: 'Academic' })

  const showToast = (msg, type = 'success') => setToast({ msg, type })

  // 1. Initial Load: Load all students
  useEffect(() => {
    loadStudents()
  }, [])

  // 2. Auto-select student from URL param or default to the first student
  useEffect(() => {
    if (students.length > 0) {
      const urlEmail = searchParams.get('student')
      const found = urlEmail ? students.find(s => s.email.toLowerCase() === urlEmail.toLowerCase()) : null
      const target = found ? found.email : (!selectedEmail ? students[0].email : selectedEmail)
      
      if (target && target !== selectedEmail) {
        selectStudent(target)
      }
    }
  }, [students, searchParams])

  async function loadStudents() {
    try {
      const data = await manageApi.listStudents()
      setStudents(data.students || [])
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  async function loadStudentRecords(email) {
    if (!email) return
    setLoading(true)
    try {
      const data = await manageApi.getStudentRecs(email)
      setRecords(data)
    } catch (e) {
      showToast(e.message, 'error')
      setRecords(null)
    } finally {
      setLoading(false)
    }
  }

  function selectStudent(email) {
    setSelectedEmail(email)
    setSearchParams({ student: email }, { replace: true })
    cancelMarksEdit()
    cancelAttendanceEdit()
    cancelRecommendationEdit()
    loadStudentRecords(email)

    // Scroll to review panel smoothly on mobile / narrow screens
    setTimeout(() => {
      const panel = document.getElementById('student-review-panel')
      if (panel && window.innerWidth < 1024) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 120)
  }

  // ── Marks Handlers ─────────────────────────────────────────────────────────

  function startEditMarks(r) {
    setEditingMarksId(r.id)
    setMarksForm({
      subject: r.subject || '',
      code: r.code || '',
      marks: r.marks !== undefined ? String(r.marks) : '',
      max_marks: String(r.maxMarks || r.max_marks || 100),
      semester: String(r.semester || 1),
      credits: String(r.credits || 3),
      teacher: r.teacher || '',
      target: String(r.target || 75),
    })
    setActiveTab('marks')
  }

  function cancelMarksEdit() {
    setEditingMarksId(null)
    setMarksForm({
      subject: '', code: '', marks: '', max_marks: '100',
      semester: records?.student?.semester ? String(records.student.semester) : '1',
      credits: '3', teacher: '', target: '75'
    })
  }

  async function submitMarks(e) {
    e.preventDefault()
    try {
      const body = {
        student_email: selectedEmail,
        subject: marksForm.subject,
        code: marksForm.code,
        marks: parseFloat(marksForm.marks),
        max_marks: parseFloat(marksForm.max_marks),
        semester: parseInt(marksForm.semester),
        credits: parseInt(marksForm.credits),
        teacher: marksForm.teacher,
        target: parseFloat(marksForm.target),
      }

      if (editingMarksId) {
        await manageApi.updateMarks(editingMarksId, body)
        showToast(`Updated marks for ${marksForm.subject}!`)
        cancelMarksEdit()
      } else {
        const res = await manageApi.addMarks(body)
        showToast(`${res.action === 'updated' ? 'Updated' : 'Added'}: ${marksForm.subject}`)
        setMarksForm(f => ({ ...f, subject: '', code: '', marks: '', teacher: '' }))
      }

      loadStudentRecords(selectedEmail)
      loadStudents()
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  async function handleModalSaveMarks(resultId, updatedData) {
    try {
      await manageApi.updateMarks(resultId, updatedData)
      showToast(`Updated ${updatedData.subject} successfully!`)
      loadStudentRecords(selectedEmail)
      loadStudents()
    } catch (e) {
      showToast(e.message, 'error')
      throw e
    }
  }

  async function deleteResult(id, subjectName) {
    if (!window.confirm(`Are you sure you want to delete ${subjectName || 'this subject result'}?`)) return
    try {
      await manageApi.deleteMarks(id)
      showToast('Subject result deleted')
      if (editingMarksId === id) cancelMarksEdit()
      loadStudentRecords(selectedEmail)
      loadStudents()
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  // ── Attendance Handlers ────────────────────────────────────────────────────

  function startEditAttendance(a) {
    setEditingAttId(a.id)
    setAttForm({
      week_label: a.week || a.week_label || '',
      pct: String(a.pct || ''),
      semester: String(a.semester || 1),
    })
    setActiveTab('attend')
  }

  function cancelAttendanceEdit() {
    setEditingAttId(null)
    setAttForm({
      week_label: '', pct: '',
      semester: records?.student?.semester ? String(records.student.semester) : '1'
    })
  }

  async function submitAttendance(e) {
    e.preventDefault()
    try {
      const body = {
        student_email: selectedEmail,
        week_label: attForm.week_label,
        pct: parseFloat(attForm.pct),
        semester: parseInt(attForm.semester),
      }

      if (editingAttId) {
        await manageApi.updateAttendance(editingAttId, body)
        showToast(`Attendance updated for ${attForm.week_label}!`)
        cancelAttendanceEdit()
      } else {
        const res = await manageApi.addAttendance(body)
        showToast(`Attendance ${res.action || 'saved'} for ${attForm.week_label}`)
        setAttForm(f => ({ ...f, week_label: '', pct: '' }))
      }

      loadStudentRecords(selectedEmail)
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  async function handleModalSaveAttendance(recordId, updatedData) {
    try {
      await manageApi.updateAttendance(recordId, updatedData)
      showToast(`Attendance updated successfully!`)
      loadStudentRecords(selectedEmail)
    } catch (e) {
      showToast(e.message, 'error')
      throw e
    }
  }

  async function deleteAttendance(id, weekLabel) {
    if (!window.confirm(`Delete attendance record for ${weekLabel || 'this week'}?`)) return
    try {
      await manageApi.deleteAttendance(id)
      showToast('Attendance record deleted')
      if (editingAttId === id) cancelAttendanceEdit()
      loadStudentRecords(selectedEmail)
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  // ── Recommendations Handlers ───────────────────────────────────────────────

  function startEditRecommendation(r) {
    setEditingRecId(r.id)
    setRecForm({
      title: r.title || '',
      explanation: r.explanation || '',
      action: r.action || '',
      priority: r.priority || 'medium',
      category: r.category || 'Academic',
    })
    setActiveTab('recs')
  }

  function cancelRecommendationEdit() {
    setEditingRecId(null)
    setRecForm({
      title: '', explanation: '', action: '', priority: 'medium', category: 'Academic'
    })
  }

  async function submitRecommendation(e) {
    e.preventDefault()
    try {
      if (editingRecId) {
        await manageApi.updateRecommendation(editingRecId, recForm)
        showToast(`Recommendation updated!`)
        cancelRecommendationEdit()
      } else {
        await manageApi.addRecommendation({ ...recForm, student_email: selectedEmail })
        showToast('Recommendation added')
        setRecForm(f => ({ ...f, title: '', explanation: '', action: '' }))
      }
      loadStudentRecords(selectedEmail)
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  async function deleteRecommendation(id) {
    if (!window.confirm('Delete this recommendation?')) return
    try {
      await manageApi.deleteRecommendation(id)
      showToast('Recommendation deleted')
      if (editingRecId === id) cancelRecommendationEdit()
      loadStudentRecords(selectedEmail)
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  // ── Profile Update Handler ─────────────────────────────────────────────────

  async function handleSaveProfile(updatedProfile) {
    try {
      await manageApi.updateStudentProfile(selectedEmail, updatedProfile)
      showToast('Student profile updated successfully!')
      loadStudentRecords(selectedEmail)
      loadStudents()
    } catch (e) {
      showToast(e.message, 'error')
      throw e
    }
  }

  // ── CSV Import ─────────────────────────────────────────────────────────────

  async function handleCsvUpload(e, type) {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch(`${API}/manage/import/${type}-csv`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('eduinsight_token')}` },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Import failed')
      showToast(`CSV: ${data.created} created, ${data.updated} updated`)
      loadStudents()
      if (selectedEmail) loadStudentRecords(selectedEmail)
    } catch (e) {
      showToast(e.message, 'error')
    }
    e.target.value = ''
  }

  const filteredStudents = students.filter(s =>
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.studentCode || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const subjectCount = records?.subjectResults?.length || 0
  const avgMarks = subjectCount > 0
    ? (records.subjectResults.reduce((acc, r) => acc + (r.marks || 0), 0) / subjectCount).toFixed(1)
    : null
  const attCount = records?.attendance?.length || 0
  const avgAttendance = attCount > 0
    ? (records.attendance.reduce((acc, a) => acc + (a.pct || 0), 0) / attCount).toFixed(1)
    : null
  const riskLevel = records?.risk?.riskLevel || 'Low'

  const tabs = [
    { id: 'review',   label: 'Review Overview',   icon: Eye },
    { id: 'marks',    label: 'Marks & Grades',     icon: BookOpen },
    { id: 'attend',   label: 'Attendance',         icon: Calendar },
    { id: 'recs',     label: 'Recommendations',    icon: BarChart3 },
    { id: 'import',   label: 'CSV Import',         icon: Upload },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Modals for Quick Editing */}
      {editingMarksModal && (
        <EditMarksModal
          result={editingMarksModal}
          onClose={() => setEditingMarksModal(null)}
          onSave={handleModalSaveMarks}
        />
      )}

      {editingAttendanceModal && (
        <EditAttendanceModal
          record={editingAttendanceModal}
          onClose={() => setEditingAttendanceModal(null)}
          onSave={handleModalSaveAttendance}
        />
      )}

      {editingProfileModal && records?.student && (
        <EditProfileModal
          student={records.student}
          onClose={() => setEditingProfileModal(false)}
          onSave={handleSaveProfile}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Student Data Management</h1>
          <p className="text-sm text-text-secondary mt-1">
            Review academic history, edit previous marks and attendance, and save updates seamlessly.
          </p>
        </div>
        {selectedEmail && (
          <button
            onClick={() => loadStudentRecords(selectedEmail)}
            className="btn btn-secondary btn-sm gap-2 self-start sm:self-auto"
            title="Refresh current student records"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh Records
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Student Directory */}
        <div className="card p-4 space-y-3 flex flex-col h-full max-h-[820px]">
          <div className="flex items-center justify-between pb-2 border-b border-border-light">
            <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">
              Students Directory ({students.length})
            </span>
            <button
              onClick={loadStudents}
              className="p-1 rounded-lg hover:bg-surface-secondary text-text-tertiary"
              title="Reload student list"
            >
              <RefreshCw size={13} />
            </button>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search by name, email, roll no..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input input-sm pl-9 w-full"
            />
          </div>

          <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-10 px-4">
                <Users size={28} className="text-text-tertiary mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-text-secondary">No students found</p>
                <p className="text-[11px] text-text-tertiary mt-0.5">Try a different search term</p>
              </div>
            ) : filteredStudents.map(s => {
              const isSelected = selectedEmail === s.email
              return (
                <button
                  key={s.id}
                  onClick={() => selectStudent(s.email)}
                  className={`w-full text-left p-3 rounded-xl transition-all border ${
                    isSelected
                      ? 'bg-royal-50/90 border-royal-400 shadow-sm ring-1 ring-royal-300'
                      : 'border-transparent hover:bg-surface-secondary hover:border-border-light'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className={`text-sm font-bold truncate ${isSelected ? 'text-royal-700' : 'text-navy-900'}`}>
                          {s.name}
                        </p>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-royal-600 shrink-0"></span>}
                      </div>
                      <p className="text-xs text-text-tertiary truncate">{s.email}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-text-secondary">
                        {s.studentCode && (
                          <span className="font-mono bg-surface-tertiary px-1 rounded">
                            {s.studentCode}
                          </span>
                        )}
                        {s.semester && <span>Sem {s.semester}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`badge text-[10px] ${s.subjectCount > 0 ? 'badge-success' : 'badge-warning'}`}>
                        {s.subjectCount} subjects
                      </span>
                      {s.avgMarks !== null && (
                        <p className="text-[10px] font-semibold text-navy-800 mt-1">
                          {s.avgMarks}% avg
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Column: Student Data Review & Edit Panel */}
        <div id="student-review-panel" className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="card p-16 text-center">
              <Loader2 size={36} className="text-royal-600 mx-auto mb-3 animate-spin" />
              <h3 className="text-base font-bold text-navy-900">Loading Student Review...</h3>
              <p className="text-xs text-text-secondary mt-1">Fetching academic history, marks, and attendance records</p>
            </div>
          ) : !selectedEmail ? (
            <div className="card p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-royal-50 text-royal-600 flex items-center justify-center mx-auto mb-4">
                <Users size={32} />
              </div>
              <h3 className="text-lg font-bold text-navy-900">Select a Student to Review</h3>
              <p className="text-sm text-text-secondary mt-1 max-w-sm mx-auto">
                Choose a student from the directory on the left to review their academic progress and edit previous records.
              </p>
            </div>
          ) : !records ? (
            <div className="card p-12 text-center">
              <AlertTriangle size={36} className="text-amber-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-navy-900">Unable to Load Records</h3>
              <p className="text-xs text-text-secondary mt-1 mb-4">
                Could not retrieve records for <strong>{selectedEmail}</strong>
              </p>
              <button onClick={() => loadStudentRecords(selectedEmail)} className="btn btn-primary btn-sm mx-auto gap-2">
                <RefreshCw size={14} /> Retry Loading
              </button>
            </div>
          ) : (
            <>
              {/* Selected Student Banner & Key Metrics */}
              {records.student && (
                <div className="card p-5 bg-gradient-to-r from-surface-primary to-surface-secondary border-border-light shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-royal-600 text-white font-black flex items-center justify-center text-lg shadow-md shadow-royal-200">
                        {records.student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-extrabold text-navy-900">{records.student.name}</h2>
                          <button
                            onClick={() => setEditingProfileModal(true)}
                            className="p-1 text-royal-600 hover:text-royal-800 hover:bg-royal-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                            title="Edit student profile details"
                          >
                            <Edit3 size={14} />
                            <span className="hidden sm:inline">Edit Profile</span>
                          </button>
                        </div>
                        <p className="text-xs text-text-tertiary mt-0.5">
                          {records.student.email} · Roll No: <span className="font-mono font-medium text-navy-800">{records.student.studentCode || 'N/A'}</span> · {records.student.department || 'General'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="px-3 py-1.5 rounded-xl bg-white border border-border-light text-center shadow-xs">
                        <p className="text-[10px] uppercase font-bold text-text-tertiary">Current Sem</p>
                        <p className="text-sm font-extrabold text-navy-900">Sem {records.student.semester || 1}</p>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-white border border-border-light text-center shadow-xs">
                        <p className="text-[10px] uppercase font-bold text-text-tertiary">Avg Marks</p>
                        <p className="text-sm font-extrabold text-royal-600">
                          {avgMarks !== null ? `${avgMarks}%` : '—'}
                        </p>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-white border border-border-light text-center shadow-xs">
                        <p className="text-[10px] uppercase font-bold text-text-tertiary">Attendance</p>
                        <p className={`text-sm font-extrabold ${
                          avgAttendance === null ? 'text-navy-900' :
                          avgAttendance >= 85 ? 'text-teal-600' :
                          avgAttendance >= 75 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {avgAttendance !== null ? `${avgAttendance}%` : '—'}
                        </p>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-white border border-border-light text-center shadow-xs">
                        <p className="text-[10px] uppercase font-bold text-text-tertiary">Risk Level</p>
                        <span className={`badge text-[10px] ${
                          riskLevel === 'Low' ? 'badge-success' :
                          riskLevel === 'Medium' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {riskLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="flex gap-1 p-1 bg-surface-secondary rounded-xl overflow-x-auto">
                {tabs.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex-1 min-w-[105px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === t.id
                        ? 'bg-white text-royal-600 shadow-sm font-bold'
                        : 'text-text-secondary hover:text-navy-900'
                    }`}
                  >
                    <t.icon size={14} />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              {/* ─── TAB 1: REVIEW OVERVIEW ────────────────────────────────────────── */}
              {activeTab === 'review' && (
                <div className="space-y-4">
                  {/* Subject Results Review Card */}
                  <SectionCard
                    title={`Subject Marks Review (${subjectCount} Subjects)`}
                    icon={BookOpen}
                    actions={
                      <button
                        onClick={() => { cancelMarksEdit(); setActiveTab('marks') }}
                        className="btn btn-primary btn-sm gap-1 text-xs"
                      >
                        <Plus size={13} /> Add New Marks
                      </button>
                    }
                  >
                    {subjectCount === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-xs text-text-tertiary">No academic marks entered yet.</p>
                        <button
                          onClick={() => setActiveTab('marks')}
                          className="btn btn-ghost btn-sm text-royal-600 text-xs mt-2"
                        >
                          Add first subject marks →
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-border-light text-text-tertiary uppercase text-[10px]">
                              <th className="py-2.5 font-bold">Subject</th>
                              <th className="py-2.5 font-bold">Sem</th>
                              <th className="py-2.5 font-bold">Marks</th>
                              <th className="py-2.5 font-bold">Grade</th>
                              <th className="py-2.5 font-bold">Target</th>
                              <th className="py-2.5 font-bold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border-light">
                            {records.subjectResults.map(r => {
                              const pct = ((r.marks / (r.maxMarks || 100)) * 100).toFixed(0)
                              return (
                                <tr key={r.id} className="hover:bg-surface-secondary/60 transition-colors">
                                  <td className="py-2.5 font-semibold text-navy-900">
                                    {r.subject}
                                    {r.code && <span className="ml-1.5 font-mono text-[10px] text-text-tertiary">({r.code})</span>}
                                  </td>
                                  <td className="py-2.5 text-text-secondary">Sem {r.semester}</td>
                                  <td className="py-2.5">
                                    <span className="font-bold text-navy-900">{r.marks}</span>
                                    <span className="text-text-tertiary"> / {r.maxMarks || 100} ({pct}%)</span>
                                  </td>
                                  <td className="py-2.5">
                                    <span className={`badge text-[10px] ${
                                      r.marks >= 80 ? 'badge-success' : r.marks >= 60 ? 'badge-info' : 'badge-danger'
                                    }`}>
                                      {r.grade}
                                    </span>
                                  </td>
                                  <td className="py-2.5">
                                    <span className={r.marks >= r.target ? 'text-teal-600 font-medium' : 'text-amber-600 font-medium'}>
                                      {r.target}% target
                                    </span>
                                  </td>
                                  <td className="py-2.5 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        onClick={() => setEditingMarksModal(r)}
                                        className="btn btn-secondary btn-sm p-1.5 h-auto text-royal-600 hover:text-royal-800"
                                        title="Quick Edit this record"
                                      >
                                        <Edit3 size={13} />
                                        <span className="hidden sm:inline text-[11px] font-medium">Edit</span>
                                      </button>
                                      <button
                                        onClick={() => deleteResult(r.id, r.subject)}
                                        className="p-1.5 rounded-lg text-text-tertiary hover:text-red-600 hover:bg-red-50 transition-colors"
                                        title="Delete this record"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </SectionCard>

                  {/* Attendance Review Card */}
                  <SectionCard
                    title={`Weekly Attendance History (${attCount} Weeks)`}
                    icon={Calendar}
                    iconBg="bg-teal-50"
                    iconColor="text-teal-600"
                    actions={
                      <button
                        onClick={() => { cancelAttendanceEdit(); setActiveTab('attend') }}
                        className="btn btn-secondary btn-sm gap-1 text-xs"
                      >
                        <Plus size={13} /> Add Week
                      </button>
                    }
                  >
                    {attCount === 0 ? (
                      <p className="text-xs text-text-tertiary py-4 text-center">No attendance logs found.</p>
                    ) : (
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {records.attendance.map(a => (
                          <div
                            key={a.id}
                            className="p-3 rounded-xl bg-surface-secondary border border-border-light flex items-center justify-between"
                          >
                            <div>
                              <p className="text-xs font-bold text-navy-900">{a.week}</p>
                              <p className="text-[11px] text-text-tertiary">Semester {a.semester}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`badge text-xs font-bold ${
                                a.pct >= 85 ? 'badge-success' : a.pct >= 75 ? 'badge-warning' : 'badge-danger'
                              }`}>
                                {a.pct}%
                              </span>
                              <button
                                onClick={() => setEditingAttendanceModal(a)}
                                className="p-1 text-text-secondary hover:text-royal-600 hover:bg-white rounded transition-colors"
                                title="Edit this week attendance"
                              >
                                <Edit3 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </SectionCard>

                  {/* Recommendations & Risk Factors */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <SectionCard title="Active Recommendations" icon={BarChart3} iconBg="bg-lavender-50" iconColor="text-lavender-600">
                      {records.recommendations?.length === 0 ? (
                        <p className="text-xs text-text-tertiary py-4 text-center">No recommendations yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {records.recommendations.map(r => (
                            <div key={r.id} className="p-2.5 rounded-xl bg-surface-secondary flex items-start justify-between gap-2">
                              <div>
                                <p className="text-xs font-semibold text-navy-900">{r.title}</p>
                                {r.action && <p className="text-[11px] text-text-tertiary mt-0.5">{r.action}</p>}
                              </div>
                              <span className={`badge text-[9px] shrink-0 ${
                                r.priority === 'high' ? 'badge-danger' : r.priority === 'medium' ? 'badge-warning' : 'badge-success'
                              }`}>
                                {r.priority}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </SectionCard>

                    <SectionCard title="Risk Evaluation Details" icon={ShieldAlert} iconBg="bg-amber-50" iconColor="text-amber-600">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-surface-secondary">
                          <span className="text-xs font-medium text-navy-900">Current Risk Level:</span>
                          <span className={`badge font-bold ${
                            riskLevel === 'Low' ? 'badge-success' :
                            riskLevel === 'Medium' ? 'badge-warning' : 'badge-danger'
                          }`}>
                            {riskLevel} (Score: {records.risk?.riskScore || 0})
                          </span>
                        </div>
                        {records.risk?.factors && Object.keys(records.risk.factors).length > 0 && (
                          <div className="p-3 rounded-xl bg-surface-secondary text-xs space-y-1">
                            <p className="font-bold text-[11px] text-text-secondary uppercase tracking-wider mb-1.5">Contributing Factors</p>
                            {Object.entries(records.risk.factors).map(([k, v]) => (
                              <div key={k} className="flex justify-between text-[11px]">
                                <span className="text-text-tertiary capitalize">{k}:</span>
                                <span className="font-medium text-navy-800">{v}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </SectionCard>
                  </div>
                </div>
              )}

              {/* ─── TAB 2: MARKS & GRADES MANAGEMENT ───────────────────────────────── */}
              {activeTab === 'marks' && (
                <div className="space-y-6">
                  {/* Marks Form */}
                  <SectionCard
                    title={editingMarksId ? `Edit Subject Marks (Updating Record)` : 'Enter New Subject Marks'}
                    icon={BookOpen}
                    actions={
                      editingMarksId && (
                        <button onClick={cancelMarksEdit} className="btn btn-ghost btn-sm text-xs gap-1">
                          <X size={13} /> Cancel Edit
                        </button>
                      )
                    }
                  >
                    {editingMarksId && (
                      <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Edit3 size={15} className="text-amber-600" />
                          <span>Currently editing previous data for <strong>{marksForm.subject}</strong></span>
                        </div>
                        <button onClick={cancelMarksEdit} className="text-amber-900 underline font-semibold text-xs">
                          Switch to Add Mode
                        </button>
                      </div>
                    )}

                    <form onSubmit={submitMarks} className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="label">Subject Name *</label>
                        <input
                          className="input"
                          placeholder="e.g. Data Structures & Algorithms"
                          value={marksForm.subject}
                          onChange={e => setMarksForm(f => ({ ...f, subject: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="label">Subject Code</label>
                        <input
                          className="input"
                          placeholder="CS301"
                          value={marksForm.code}
                          onChange={e => setMarksForm(f => ({ ...f, code: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="label">Teacher</label>
                        <input
                          className="input"
                          placeholder="Prof. Smith"
                          value={marksForm.teacher}
                          onChange={e => setMarksForm(f => ({ ...f, teacher: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="label">Marks Obtained *</label>
                        <input
                          className="input"
                          type="number"
                          min="0"
                          max="200"
                          step="0.5"
                          required
                          placeholder="e.g. 85"
                          value={marksForm.marks}
                          onChange={e => setMarksForm(f => ({ ...f, marks: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="label">Max Marks</label>
                        <input
                          className="input"
                          type="number"
                          min="1"
                          max="200"
                          value={marksForm.max_marks}
                          onChange={e => setMarksForm(f => ({ ...f, max_marks: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="label">Semester *</label>
                        <select
                          className="input"
                          value={marksForm.semester}
                          onChange={e => setMarksForm(f => ({ ...f, semester: e.target.value }))}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                            <option key={n} value={n}>Semester {n}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label">Credits</label>
                        <input
                          className="input"
                          type="number"
                          min="1"
                          max="6"
                          value={marksForm.credits}
                          onChange={e => setMarksForm(f => ({ ...f, credits: e.target.value }))}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="label">Target Benchmark Marks (%)</label>
                        <input
                          className="input"
                          type="number"
                          min="0"
                          max="100"
                          value={marksForm.target}
                          onChange={e => setMarksForm(f => ({ ...f, target: e.target.value }))}
                        />
                      </div>
                      <div className="col-span-2 pt-2 flex items-center gap-2">
                        <button type="submit" className="btn btn-primary flex-1 gap-2">
                          <Save size={15} />
                          {editingMarksId ? 'Update & Save Changes' : 'Save Marks'}
                        </button>
                        {editingMarksId && (
                          <button type="button" onClick={cancelMarksEdit} className="btn btn-secondary">
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </SectionCard>

                  {/* Previous Results Table */}
                  <SectionCard
                    title={`Previous Subject Records (${records.subjectResults?.length || 0})`}
                    icon={FileText}
                    iconBg="bg-teal-50"
                    iconColor="text-teal-600"
                  >
                    {records.subjectResults?.length === 0 ? (
                      <p className="text-xs text-text-tertiary text-center py-6">No previous records exist for this student.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {records.subjectResults.map(r => (
                          <div
                            key={r.id}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border transition-all ${
                              editingMarksId === r.id
                                ? 'bg-amber-50/70 border-amber-300'
                                : 'bg-surface-secondary border-border-light hover:border-royal-200'
                            }`}
                          >
                            <div className="mb-2 sm:mb-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-navy-900">{r.subject}</p>
                                {r.code && <span className="font-mono text-xs text-text-tertiary font-semibold">{r.code}</span>}
                                {editingMarksId === r.id && (
                                  <span className="badge badge-warning text-[9px]">Editing</span>
                                )}
                              </div>
                              <p className="text-xs text-text-tertiary mt-0.5">
                                Sem {r.semester} · Credits: {r.credits} · Teacher: {r.teacher || 'N/A'} · Target: {r.target}%
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <span className="text-sm font-black text-navy-900">{r.marks}</span>
                                <span className="text-xs text-text-tertiary"> / {r.maxMarks}</span>
                                <div className="mt-0.5">
                                  <span className={`badge text-[10px] ${
                                    r.marks >= 80 ? 'badge-success' : r.marks >= 60 ? 'badge-info' : 'badge-danger'
                                  }`}>
                                    Grade: {r.grade}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 border-l border-border-light pl-2">
                                <button
                                  onClick={() => startEditMarks(r)}
                                  className="btn btn-secondary btn-sm p-1.5 h-auto text-royal-600 hover:text-royal-800"
                                  title="Edit in form above"
                                >
                                  <Edit3 size={13} />
                                  <span className="text-[11px]">Edit</span>
                                </button>
                                <button
                                  onClick={() => deleteResult(r.id, r.subject)}
                                  className="p-1.5 rounded-lg text-text-tertiary hover:text-red-500 hover:bg-red-50 transition-colors"
                                  title="Delete this record"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </SectionCard>
                </div>
              )}

              {/* ─── TAB 3: ATTENDANCE MANAGEMENT ───────────────────────────────────── */}
              {activeTab === 'attend' && (
                <div className="space-y-6">
                  {/* Attendance Form */}
                  <SectionCard
                    title={editingAttId ? 'Edit Weekly Attendance' : 'Record Weekly Attendance'}
                    icon={Calendar}
                    iconBg="bg-teal-50"
                    iconColor="text-teal-600"
                    actions={
                      editingAttId && (
                        <button onClick={cancelAttendanceEdit} className="btn btn-ghost btn-sm text-xs gap-1">
                          <X size={13} /> Cancel Edit
                        </button>
                      )
                    }
                  >
                    {editingAttId && (
                      <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Edit3 size={15} className="text-amber-600" />
                          <span>Editing attendance record for <strong>{attForm.week_label}</strong></span>
                        </div>
                        <button onClick={cancelAttendanceEdit} className="text-amber-900 underline font-semibold text-xs">
                          Switch to Add Mode
                        </button>
                      </div>
                    )}

                    <form onSubmit={submitAttendance} className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label">Week Label *</label>
                        <input
                          className="input"
                          placeholder="e.g. Week 1, W1, 01-Oct"
                          required
                          value={attForm.week_label}
                          onChange={e => setAttForm(f => ({ ...f, week_label: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="label">Attendance % *</label>
                        <input
                          className="input"
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          required
                          placeholder="e.g. 92.5"
                          value={attForm.pct}
                          onChange={e => setAttForm(f => ({ ...f, pct: e.target.value }))}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="label">Semester *</label>
                        <select
                          className="input"
                          value={attForm.semester}
                          onChange={e => setAttForm(f => ({ ...f, semester: e.target.value }))}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                            <option key={n} value={n}>Semester {n}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2 pt-2 flex items-center gap-2">
                        <button type="submit" className="btn btn-primary flex-1 gap-2">
                          <Save size={15} />
                          {editingAttId ? 'Update & Save Attendance' : 'Save Attendance'}
                        </button>
                        {editingAttId && (
                          <button type="button" onClick={cancelAttendanceEdit} className="btn btn-secondary">
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </SectionCard>

                  {/* Attendance List */}
                  <SectionCard
                    title={`Recorded Attendance Records (${records.attendance?.length || 0})`}
                    icon={FileText}
                    iconBg="bg-teal-50"
                    iconColor="text-teal-600"
                  >
                    {records.attendance?.length === 0 ? (
                      <p className="text-xs text-text-tertiary text-center py-6">No attendance records logged yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {records.attendance.map(a => (
                          <div
                            key={a.id}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                              editingAttId === a.id
                                ? 'bg-amber-50/70 border-amber-300'
                                : 'bg-surface-secondary border-border-light'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-navy-900">{a.week}</p>
                              <span className="text-xs text-text-tertiary">(Semester {a.semester})</span>
                              {editingAttId === a.id && (
                                <span className="badge badge-warning text-[9px]">Editing</span>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              <span className={`badge ${
                                a.pct >= 85 ? 'badge-success' : a.pct >= 75 ? 'badge-warning' : 'badge-danger'
                              }`}>
                                {a.pct}%
                              </span>
                              <div className="flex items-center gap-1 border-l border-border-light pl-2">
                                <button
                                  onClick={() => startEditAttendance(a)}
                                  className="btn btn-secondary btn-sm p-1.5 h-auto text-royal-600 hover:text-royal-800"
                                  title="Edit this record"
                                >
                                  <Edit3 size={13} />
                                  <span className="text-[11px]">Edit</span>
                                </button>
                                <button
                                  onClick={() => deleteAttendance(a.id, a.week)}
                                  className="p-1.5 rounded-lg text-text-tertiary hover:text-red-500 hover:bg-red-50 transition-colors"
                                  title="Delete this record"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </SectionCard>
                </div>
              )}

              {/* ─── TAB 4: RECOMMENDATIONS ─────────────────────────────────────────── */}
              {activeTab === 'recs' && (
                <div className="space-y-6">
                  <SectionCard
                    title={editingRecId ? 'Edit Recommendation' : 'Add AI / Faculty Recommendation'}
                    icon={BarChart3}
                    iconBg="bg-lavender-50"
                    iconColor="text-lavender-600"
                    actions={
                      editingRecId && (
                        <button onClick={cancelRecommendationEdit} className="btn btn-ghost btn-sm text-xs gap-1">
                          <X size={13} /> Cancel Edit
                        </button>
                      )
                    }
                  >
                    <form onSubmit={submitRecommendation} className="space-y-3">
                      <div>
                        <label className="label">Title *</label>
                        <input
                          className="input"
                          required
                          placeholder="e.g. Focus on Graph Algorithms"
                          value={recForm.title}
                          onChange={e => setRecForm(f => ({ ...f, title: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="label">Explanation</label>
                        <textarea
                          className="input"
                          rows={2}
                          placeholder="Why this recommendation is necessary..."
                          value={recForm.explanation}
                          onChange={e => setRecForm(f => ({ ...f, explanation: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="label">Suggested Action</label>
                        <textarea
                          className="input"
                          rows={2}
                          placeholder="Steps the student should take..."
                          value={recForm.action}
                          onChange={e => setRecForm(f => ({ ...f, action: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="label">Priority</label>
                          <select
                            className="input"
                            value={recForm.priority}
                            onChange={e => setRecForm(f => ({ ...f, priority: e.target.value }))}
                          >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </div>
                        <div>
                          <label className="label">Category</label>
                          <select
                            className="input"
                            value={recForm.category}
                            onChange={e => setRecForm(f => ({ ...f, category: e.target.value }))}
                          >
                            <option>Academic</option>
                            <option>Attendance</option>
                            <option>Assignments</option>
                            <option>Support</option>
                            <option>Career</option>
                          </select>
                        </div>
                      </div>
                      <div className="pt-2 flex items-center gap-2">
                        <button type="submit" className="btn btn-primary flex-1 gap-2">
                          <Plus size={15} />
                          {editingRecId ? 'Update & Save Recommendation' : 'Add Recommendation'}
                        </button>
                        {editingRecId && (
                          <button type="button" onClick={cancelRecommendationEdit} className="btn btn-secondary">
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </SectionCard>

                  {/* Previous Recommendations List */}
                  <SectionCard
                    title={`Previous Recommendations (${records.recommendations?.length || 0})`}
                    icon={FileText}
                  >
                    {records.recommendations?.length === 0 ? (
                      <p className="text-xs text-text-tertiary text-center py-6">No recommendations found.</p>
                    ) : (
                      <div className="space-y-2">
                        {records.recommendations.map(r => (
                          <div
                            key={r.id}
                            className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${
                              editingRecId === r.id ? 'bg-amber-50/70 border-amber-300' : 'bg-surface-secondary border-border-light'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-navy-900">{r.title}</p>
                                <span className="text-[10px] text-text-tertiary">({r.category})</span>
                              </div>
                              {r.explanation && <p className="text-xs text-text-secondary">{r.explanation}</p>}
                              {r.action && <p className="text-xs text-royal-600 font-medium">Action: {r.action}</p>}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`badge text-[10px] ${
                                r.priority === 'high' ? 'badge-danger' : r.priority === 'medium' ? 'badge-warning' : 'badge-success'
                              }`}>
                                {r.priority}
                              </span>
                              <button
                                onClick={() => startEditRecommendation(r)}
                                className="btn btn-secondary btn-sm p-1.5 h-auto text-royal-600"
                                title="Edit this recommendation"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                onClick={() => deleteRecommendation(r.id)}
                                className="p-1.5 rounded-lg text-text-tertiary hover:text-red-500 hover:bg-red-50"
                                title="Delete this recommendation"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </SectionCard>
                </div>
              )}

              {/* ─── TAB 5: CSV BULK IMPORT ─────────────────────────────────────────── */}
              {activeTab === 'import' && (
                <div className="space-y-4">
                  <SectionCard title="Bulk Import — Marks CSV" icon={Upload} iconBg="bg-amber-50" iconColor="text-amber-600">
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
                        <p className="font-semibold mb-1">Required CSV columns:</p>
                        <p className="font-mono">student_email, subject, marks, max_marks, semester</p>
                        <p className="mt-1 text-amber-600">Optional: code, grade, credits, teacher, target</p>
                      </div>
                      <label className="btn btn-secondary w-full gap-2 cursor-pointer">
                        <Upload size={15} /> Choose Marks CSV
                        <input type="file" accept=".csv" className="hidden" onChange={e => handleCsvUpload(e, 'marks')} />
                      </label>
                      <p className="text-[11px] text-text-tertiary text-center">
                        Existing records will be updated. Duplicates are detected by (email + subject + semester).
                      </p>
                    </div>
                  </SectionCard>

                  <SectionCard title="Bulk Import — Attendance CSV" icon={Calendar} iconBg="bg-teal-50" iconColor="text-teal-600">
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-700">
                        <p className="font-semibold mb-1">Required CSV columns:</p>
                        <p className="font-mono">student_email, week_label, pct, semester</p>
                      </div>
                      <label className="btn btn-secondary w-full gap-2 cursor-pointer">
                        <Upload size={15} /> Choose Attendance CSV
                        <input type="file" accept=".csv" className="hidden" onChange={e => handleCsvUpload(e, 'attendance')} />
                      </label>
                    </div>
                  </SectionCard>

                  {/* Download sample CSVs */}
                  <SectionCard title="Sample CSV Templates" icon={FileText} iconBg="bg-lavender-50" iconColor="text-lavender-600">
                    <div className="space-y-2">
                      <button
                        onClick={() => downloadSample('marks')}
                        className="btn btn-ghost w-full text-xs gap-2 justify-start"
                      >
                        <FileText size={13} /> Download sample marks CSV
                      </button>
                      <button
                        onClick={() => downloadSample('attendance')}
                        className="btn btn-ghost w-full text-xs gap-2 justify-start"
                      >
                        <FileText size={13} /> Download sample attendance CSV
                      </button>
                    </div>
                  </SectionCard>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function downloadSample(type) {
  let csv, name
  if (type === 'marks') {
    csv = 'student_email,subject,marks,max_marks,semester,code,credits,teacher,target\n' +
          'student@example.com,Mathematics,85,100,4,MA301,3,Prof. Smith,75\n' +
          'student@example.com,Data Structures,78,100,4,CS301,4,Prof. Jones,80\n'
    name = 'sample_marks.csv'
  } else {
    csv = 'student_email,week_label,pct,semester\n' +
          'student@example.com,W1,95,4\n' +
          'student@example.com,W2,90,4\n' +
          'student@example.com,W3,85,4\n'
    name = 'sample_attendance.csv'
  }
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = name; a.click()
  URL.revokeObjectURL(url)
}
