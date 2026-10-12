import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { studentApi } from '../../services/api'
import {
  Award, CheckCircle2, Clock, AlertCircle, FileText,
  Search, RefreshCw,
  Calendar, BookOpen, Send, X
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, Cell
} from 'recharts'

function Skeleton({ className = '' }) {
  return <div className={`bg-border-subtle animate-pulse rounded-lg ${className}`}></div>
}

function getGradeBadge(grade) {
  if (!grade) return 'badge-neutral'
  if (grade.startsWith('A')) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (grade.startsWith('B')) return 'bg-blue-50 text-blue-700 border-blue-200'
  if (grade.startsWith('C')) return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-red-50 text-red-700 border-red-200'
}

function getTypeBadge(type) {
  switch (type) {
    case 'Mid-Term':
      return 'bg-purple-50 text-purple-700 border-purple-200'
    case 'Lab Practical':
      return 'bg-teal-50 text-teal-700 border-teal-200'
    case 'Unit Test':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'Project':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    default:
      return 'bg-indigo-50 text-indigo-700 border-indigo-200'
  }
}

export default function StudentAssessments() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all') // all, pending, graded
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals state
  const [submittingAssessment, setSubmittingAssessment] = useState(null)
  const [submissionText, setSubmissionText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(null)
  const [viewingResult, setViewingResult] = useState(null)

  const fetchAssessments = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await studentApi.getAssessments()
      setData(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchAssessments()
    }
  }, [user?.id])

  const handleOpenSubmit = (asm) => {
    setSubmittingAssessment(asm)
    setSubmissionText(asm.submission?.submissionText || '')
    setSubmitSuccess(null)
  }

  const handleSubmitSolution = async (e) => {
    e.preventDefault()
    if (!submittingAssessment || !submissionText.trim()) return

    setSubmitting(true)
    try {
      const res = await studentApi.submitAssessment(submittingAssessment.id, {
        submissionText: submissionText.trim()
      })
      setSubmitSuccess(res)
      setTimeout(() => {
        setSubmittingAssessment(null)
        setSubmitSuccess(null)
        fetchAssessments()
      }, 1800)
    } catch (err) {
      alert(`Submission error: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-12 w-72" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-10 text-center">
        <AlertCircle size={36} className="text-red-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-navy-900 mb-2">Failed to load assessments</h3>
        <p className="text-sm text-text-secondary mb-4">{error}</p>
        <button onClick={fetchAssessments} className="btn btn-primary btn-sm inline-flex items-center gap-2">
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    )
  }

  const assessments = data?.assessments || []
  const stats = data?.stats || { total: 0, completed: 0, pending: 0, averageScore: 0 }
  const semester = data?.semester || user?.semester || 1

  const subjects = Array.from(new Set(assessments.map(a => a.subject)))

  const filtered = assessments.filter(a => {
    const isCompleted = a.submission && (a.submission.status === 'Graded' || a.submission.status === 'Submitted')
    if (activeTab === 'pending' && isCompleted) return false
    if (activeTab === 'graded' && !isCompleted) return false
    if (selectedSubject !== 'all' && a.subject !== selectedSubject) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchTitle = a.title.toLowerCase().includes(q)
      const matchSubject = a.subject.toLowerCase().includes(q)
      const matchDesc = a.description?.toLowerCase().includes(q)
      if (!matchTitle && !matchSubject && !matchDesc) return false
    }
    return true
  })

  const subjectChartData = subjects.map(s => {
    const matching = assessments.filter(a => a.subject === s && a.submission?.percentage != null)
    const avg = matching.length > 0
      ? Math.round(matching.reduce((acc, curr) => acc + curr.submission.percentage, 0) / matching.length)
      : 0
    return {
      subject: s.length > 14 ? s.slice(0, 12) + '…' : s,
      fullSubject: s,
      score: avg,
      target: 75
    }
  }).filter(item => item.score > 0)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Student Assessments Banner */}
      <div className="student-hero p-6 sm:p-7 text-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-royal-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold badge-streak shadow-xs">
                <Award size={13} className="text-amber-500" />
                Graded Academic Center
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold badge-level shadow-xs">
                Semester {semester}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
              Subject Assessments & Evaluations 🎯
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              Submit your project deliverables, view faculty remarks, and monitor your score distribution.
            </p>
          </div>
          <button
            onClick={fetchAssessments}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all backdrop-blur-md self-start md:self-auto shrink-0"
            title="Refresh assessments"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 border-l-4 border-l-royal-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Average Score</span>
            <div className="w-8 h-8 rounded-lg bg-royal-50 flex items-center justify-center text-royal-600">
              <Award size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-navy-900">{stats.averageScore}%</p>
          <div className="mt-2 progress-bar">
            <div
              className="progress-bar-fill bg-royal-500"
              style={{ width: `${Math.min(stats.averageScore, 100)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-text-tertiary mt-2">Across evaluated tests</p>
        </div>

        <div className="card p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Completed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-navy-900">{stats.completed} <span className="text-xs font-normal text-text-tertiary">/ {stats.total}</span></p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-2">
            {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% completion rate
          </p>
        </div>

        <div className="card p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Pending Action</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600">{stats.pending}</p>
          <p className="text-[11px] text-text-tertiary mt-2">Due this semester</p>
        </div>

        <div className="card p-5 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Enrolled Subjects</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <BookOpen size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-navy-900">{subjects.length}</p>
          <p className="text-[11px] text-purple-600 font-medium mt-2">Curriculum aligned</p>
        </div>
      </div>

      {/* Performance Chart by Subject */}
      {subjectChartData.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Evaluated Subject Performance</h3>
              <p className="text-xs text-text-tertiary">Average score obtained in subject assessments vs 75% target</p>
            </div>
            <span className="badge badge-success text-xs">Target: 75%</span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const dataItem = payload[0].payload
                      return (
                        <div className="bg-white border border-border-default shadow-lg rounded-xl p-3 text-xs">
                          <p className="font-bold text-navy-900">{dataItem.fullSubject}</p>
                          <p className="text-royal-600 font-semibold mt-1">Average: {dataItem.score}%</p>
                          <p className="text-text-tertiary">Benchmark: {dataItem.target}%</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {subjectChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.score >= 85 ? '#10b981' : entry.score >= 75 ? '#2563eb' : '#f59e0b'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tabs and Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border-default pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-navy-900 text-white shadow-sm'
                : 'text-text-secondary hover:bg-surface-tertiary'
            }`}
          >
            All Assessments ({assessments.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'pending'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-text-secondary hover:bg-surface-tertiary'
            }`}
          >
            Pending / To Take ({stats.pending})
          </button>
          <button
            onClick={() => setActiveTab('graded')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'graded'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-text-secondary hover:bg-surface-tertiary'
            }`}
          >
            Evaluated & Graded ({stats.completed})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assessment..."
              className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-border-default bg-white focus:outline-none focus:border-royal-500 w-44 sm:w-56"
            />
          </div>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs border border-border-default rounded-lg px-2.5 py-1.5 bg-white text-navy-900 focus:outline-none focus:border-royal-500"
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Assessment Cards List */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText size={36} className="text-text-tertiary mx-auto mb-3" />
          <h4 className="text-sm font-bold text-navy-900 mb-1">No assessments match your criteria</h4>
          <p className="text-xs text-text-secondary mb-4">Try selecting another filter or clearing your search query.</p>
          <button
            onClick={() => { setActiveTab('all'); setSelectedSubject('all'); setSearchQuery('') }}
            className="btn btn-secondary btn-sm"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(asm => {
            const sub = asm.submission
            const isGraded = sub && sub.status === 'Graded'

            return (
              <div
                key={asm.id}
                className={`card p-5 transition-all duration-200 hover:shadow-card-hover flex flex-col justify-between ${
                  isGraded ? 'border-t-4 border-t-emerald-500' : 'border-t-4 border-t-amber-500'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-royal-600 bg-royal-50 px-2 py-0.5 rounded">
                        {asm.code || asm.subject}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${getTypeBadge(asm.type)}`}>
                        {asm.type}
                      </span>
                      <span className="text-[10px] text-text-tertiary font-medium">
                        {asm.weightagePct}% weight
                      </span>
                    </div>

                    {isGraded ? (
                      <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full border ${getGradeBadge(sub.grade)}`}>
                        Grade {sub.grade}
                      </span>
                    ) : (
                      <span className="badge badge-warning text-[10px]">
                        Pending
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-navy-900 leading-snug">
                    {asm.title}
                  </h3>
                  <p className="text-xs text-text-secondary font-medium mt-0.5">
                    Subject: {asm.subject}
                  </p>

                  {asm.description && (
                    <p className="text-xs text-text-secondary mt-2 line-clamp-2 leading-relaxed">
                      {asm.description}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 mt-3 text-xs text-text-tertiary">
                    <Calendar size={13} />
                    <span>Due: {asm.dueDate || 'End of Semester'}</span>
                    <span className="mx-1">•</span>
                    <span>Max Marks: {asm.maxMarks}</span>
                  </div>

                  {isGraded && (
                    <div className="mt-4 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-bold text-emerald-900">Evaluated Score</p>
                          <p className="text-lg font-black text-emerald-800">
                            {sub.marksObtained} <span className="text-xs font-medium text-emerald-700">/ {sub.maxMarks} ({sub.percentage}%)</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-emerald-700 font-medium">Graded: {sub.gradedAt?.split(' ')[0]}</p>
                        </div>
                      </div>
                      {sub.feedback && (
                        <p className="text-xs text-emerald-950 mt-1.5 italic bg-white/60 p-2 rounded border border-emerald-100/80">
                          "{sub.feedback}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-border-default flex items-center justify-between">
                  <div className="text-[11px] text-text-tertiary">
                    {isGraded ? 'Score logged in database' : 'Ready to submit'}
                  </div>

                  {isGraded ? (
                    <button
                      onClick={() => setViewingResult(asm)}
                      className="btn btn-secondary btn-sm flex items-center gap-1.5 text-xs"
                    >
                      <FileText size={13} /> View Feedback
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenSubmit(asm)}
                      className="btn btn-primary btn-sm flex items-center gap-1.5 text-xs shadow-sm"
                    >
                      <Send size={13} /> Submit Solution
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal: Submit Solution / Take Assessment */}
      {submittingAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-modal max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border-default pb-3 mb-4">
              <div>
                <span className="badge badge-info text-[10px] mb-1">{submittingAssessment.code || submittingAssessment.subject}</span>
                <h3 className="text-lg font-extrabold text-navy-900">{submittingAssessment.title}</h3>
              </div>
              <button
                onClick={() => setSubmittingAssessment(null)}
                className="p-1 rounded-lg text-text-tertiary hover:bg-surface-tertiary"
              >
                <X size={20} />
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-lg font-bold text-navy-900">Assessment Submitted & Graded!</h4>
                <p className="text-sm text-text-secondary">
                  Your work was scored: <strong className="text-emerald-600">{submitSuccess.marksObtained}/{submitSuccess.maxMarks} ({submitSuccess.percentage}%)</strong>
                </p>
                <div className="p-3 rounded-lg bg-surface-secondary text-xs text-text-secondary max-w-md mx-auto italic">
                  "{submitSuccess.feedback}"
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitSolution} className="space-y-4">
                <div className="p-3 rounded-xl bg-surface-secondary text-xs text-text-secondary space-y-1">
                  <p><strong className="text-navy-900">Type:</strong> {submittingAssessment.type} • <strong className="text-navy-900">Max Marks:</strong> {submittingAssessment.maxMarks}</p>
                  <p><strong className="text-navy-900">Prompt:</strong> {submittingAssessment.description}</p>
                  <p className="text-[11px] text-text-tertiary pt-1 border-t border-border-default">
                    💡 Provide your technical write-up, derivations, algorithm analysis, or solution notes below.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Your Solution / Submission Notes:
                  </label>
                  <textarea
                    rows={7}
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Type or paste your complete solution, code explanations, mathematical derivations, or answers..."
                    className="w-full text-xs p-3 rounded-xl border border-border-default bg-white focus:outline-none focus:border-royal-500 focus:ring-1 focus:ring-royal-500"
                    required
                  ></textarea>
                  <div className="flex justify-between items-center text-[11px] text-text-tertiary mt-1">
                    <span>Word count: {submissionText.trim() ? submissionText.trim().split(/\s+/).length : 0} words</span>
                    <span>Evaluation rubric: Technical accuracy & completeness</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-default">
                  <button
                    type="button"
                    onClick={() => setSubmittingAssessment(null)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !submissionText.trim()}
                    className="btn btn-primary btn-sm flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={14} /> Submit & Evaluate
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: View Graded Result & Feedback */}
      {viewingResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-modal max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border-default pb-3 mb-4">
              <div>
                <span className="badge badge-info text-[10px] mb-1">{viewingResult.code || viewingResult.subject}</span>
                <h3 className="text-base font-extrabold text-navy-900">{viewingResult.title}</h3>
              </div>
              <button
                onClick={() => setViewingResult(null)}
                className="p-1 rounded-lg text-text-tertiary hover:bg-surface-tertiary"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-royal-50 border border-royal-100 text-center">
                <p className="text-xs text-royal-700 font-semibold uppercase tracking-wider">Assessment Result</p>
                <p className="text-3xl font-black text-navy-900 my-1">
                  {viewingResult.submission?.marksObtained} <span className="text-lg font-medium text-text-tertiary">/ {viewingResult.submission?.maxMarks}</span>
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getGradeBadge(viewingResult.submission?.grade)}`}>
                    Grade {viewingResult.submission?.grade}
                  </span>
                  <span className="text-xs font-semibold text-royal-700">
                    {viewingResult.submission?.percentage}% Score
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">Evaluator Feedback</h4>
                <div className="p-3 rounded-xl bg-surface-secondary border border-border-default text-xs text-text-secondary italic">
                  "{viewingResult.submission?.feedback || 'Satisfactory completion.'}"
                </div>
              </div>

              {viewingResult.submission?.submissionText && (
                <div>
                  <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">Submitted Solution</h4>
                  <div className="p-3 rounded-xl bg-surface-secondary border border-border-default text-xs text-text-secondary whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {viewingResult.submission.submissionText}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-border-default text-[11px] text-text-tertiary flex justify-between">
                <span>Submitted: {viewingResult.submission?.submittedAt || 'N/A'}</span>
                <span>Graded: {viewingResult.submission?.gradedAt || 'N/A'}</span>
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setViewingResult(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
