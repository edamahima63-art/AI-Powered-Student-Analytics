import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { studentApi } from '../../services/api'
import {
  HelpCircle, CheckCircle2, XCircle, Clock,
  Sparkles, RotateCcw, ArrowRight, ArrowLeft,
  AlertTriangle, BookOpen,
  RefreshCw, Trophy, Eye, X,
  Check, Zap, Target
} from 'lucide-react'

function Skeleton({ className = '' }) {
  return <div className={`bg-border-subtle animate-pulse rounded-lg ${className}`}></div>
}

function getDifficultyBadge(diff) {
  switch (diff) {
    case 'Beginner':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'Intermediate':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'Advanced':
      return 'bg-purple-50 text-purple-700 border-purple-200'
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200'
  }
}

function getSubjectTheme(subject) {
  if (!subject) return { bg: 'bg-navy-50 text-navy-700', border: 'border-navy-200', bar: '#1e3a5f' }
  const s = subject.toLowerCase()
  if (s.includes('data structure')) return { bg: 'bg-royal-50 text-royal-700', border: 'border-royal-200', bar: '#2563eb' }
  if (s.includes('algorithm')) return { bg: 'bg-indigo-50 text-indigo-700', border: 'border-indigo-200', bar: '#4f46e5' }
  if (s.includes('database')) return { bg: 'bg-teal-50 text-teal-700', border: 'border-teal-200', bar: '#0d9488' }
  if (s.includes('operating')) return { bg: 'bg-purple-50 text-purple-700', border: 'border-purple-200', bar: '#7c3aed' }
  if (s.includes('network')) return { bg: 'bg-cyan-50 text-cyan-700', border: 'border-cyan-200', bar: '#0891b2' }
  if (s.includes('math')) return { bg: 'bg-amber-50 text-amber-700', border: 'border-amber-200', bar: '#d97706' }
  return { bg: 'bg-royal-50 text-royal-700', border: 'border-royal-200', bar: '#2563eb' }
}

export default function StudentQuizzes() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Tab & Filters
  const [activeTab, setActiveTab] = useState('quizzes') // 'quizzes' or 'history'
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')

  // History State
  const [historyData, setHistoryData] = useState(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [selectedAttemptDetail, setSelectedAttemptDetail] = useState(null)

  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [activeQuizQuestions, setActiveQuizQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [submittingQuiz, setSubmittingQuiz] = useState(false)
  const [quizStartTime, setQuizStartTime] = useState(null)

  // Latest Completed Result Screen
  const [latestResult, setLatestResult] = useState(null)

  // Fetch Quizzes List
  const fetchQuizzes = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await studentApi.getQuizzes()
      setData(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch History List
  const fetchHistory = async () => {
    setLoadingHistory(true)
    try {
      const res = await studentApi.getQuizHistory()
      setHistoryData(res)
    } catch (err) {
      console.error('Failed to load history:', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchQuizzes()
    }
  }, [user?.id])

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory()
    }
  }, [activeTab])

  const handleSubmitQuiz = async () => {
    if (!activeQuiz || submittingQuiz) return
    setSubmittingQuiz(true)
    try {
      const timeTakenSec = quizStartTime
        ? Math.round((Date.now() - quizStartTime) / 1000)
        : (activeQuiz.durationMinutes * 60 - timeRemaining)

      const result = await studentApi.submitQuiz(activeQuiz.id, {
        answers: userAnswers,
        timeTakenSeconds: timeTakenSec
      })

      setLatestResult(result)
      setActiveQuiz(null)
      fetchQuizzes()
      if (activeTab === 'history') fetchHistory()
    } catch (err) {
      alert(`Submission error: ${err.message}`)
    } finally {
      setSubmittingQuiz(false)
    }
  }

  // Timer effect for active quiz countdown
  useEffect(() => {
    if (!activeQuiz || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [activeQuiz, timeRemaining])

  // Auto-submit when timer expires
  useEffect(() => {
    if (activeQuiz && timeRemaining === 0 && quizStartTime && !submittingQuiz) {
      handleSubmitQuiz()
    }
  }, [activeQuiz, timeRemaining, quizStartTime, submittingQuiz])

  const handleStartQuiz = async (quiz) => {
    try {
      setLoading(true)
      const detail = await studentApi.getQuiz(quiz.id)
      setActiveQuiz(detail)
      setActiveQuizQuestions(detail.questions || [])
      setCurrentQuestionIndex(0)
      setUserAnswers({})
      const totalSec = (detail.durationMinutes || 15) * 60
      setTimeRemaining(totalSec)
      setQuizStartTime(Date.now())
      setLatestResult(null)
    } catch (err) {
      alert(`Could not start quiz: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectOption = (questionId, optionKey) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionKey
    }))
  }

  const handleViewAttemptDetail = async (attemptId) => {
    setLoadingAttemptDetail(true)
    try {
      const detail = await studentApi.getQuizAttempt(attemptId)
      setSelectedAttemptDetail(detail)
    } catch (err) {
      alert(`Failed to load review: ${err.message}`)
    } finally {
      setLoadingAttemptDetail(false)
    }
  }

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60)
    const rem = secs % 60
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`
  }

  if (loading && !activeQuiz) {
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
        <AlertTriangle size={36} className="text-red-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-navy-900 mb-2">Failed to load subject quizzes</h3>
        <p className="text-sm text-text-secondary mb-4">{error}</p>
        <button onClick={fetchQuizzes} className="btn btn-primary btn-sm inline-flex items-center gap-2">
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    )
  }

  const quizzes = data?.quizzes || []
  const stats = data?.stats || {
    totalAvailable: 0,
    quizzesAttempted: 0,
    totalAttempts: 0,
    passedCount: 0,
    overallAccuracy: 0
  }
  const semester = data?.semester || 4

  const subjects = Array.from(new Set(quizzes.map(q => q.subject)))

  const filteredQuizzes = quizzes.filter(q => {
    if (selectedSubject !== 'all' && q.subject !== selectedSubject) return false
    if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false
    return true
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // MODE 1: ACTIVE QUIZ IN PROGRESS
  // ═══════════════════════════════════════════════════════════════════════════
  if (activeQuiz) {
    const currentQ = activeQuizQuestions[currentQuestionIndex]
    const answeredCount = Object.keys(userAnswers).length
    const isLastQuestion = currentQuestionIndex === activeQuizQuestions.length - 1
    const isUrgent = timeRemaining < 120

    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
        {/* Sticky Quiz Header */}
        <div className="card p-4 sticky top-4 z-30 shadow-modal border-royal-100 bg-white/95 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="badge badge-info text-xs">{activeQuiz.code || activeQuiz.subject}</span>
                <span className="text-xs text-text-tertiary">Semester {activeQuiz.semester}</span>
              </div>
              <h2 className="text-base font-extrabold text-navy-900 mt-0.5">{activeQuiz.title}</h2>
            </div>

            {/* Timer & Exit */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-sm font-bold border transition-colors ${
                isUrgent
                  ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                  : 'bg-surface-secondary text-navy-900 border-border-default'
              }`}>
                <Clock size={16} className={isUrgent ? 'text-red-500' : 'text-royal-500'} />
                <span>{formatTime(timeRemaining)}</span>
              </div>

              <button
                onClick={() => {
                  if (confirm('Are you sure you want to exit? Your answers for this attempt will not be saved.')) {
                    setActiveQuiz(null)
                  }
                }}
                className="btn btn-secondary btn-sm text-xs text-text-tertiary hover:text-red-600"
              >
                Exit Quiz
              </button>
            </div>
          </div>

          {/* Question Dots Bar */}
          <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1.5">
              {activeQuizQuestions.map((q, idx) => {
                const isAnswered = !!userAnswers[q.id]
                const isCurrent = idx === currentQuestionIndex
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                      isCurrent
                        ? 'bg-royal-600 text-white shadow-sm ring-2 ring-royal-200'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-surface-secondary text-text-tertiary hover:bg-surface-tertiary'
                    }`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
            <div className="text-xs text-text-secondary whitespace-nowrap">
              Answered: <strong className="text-navy-900">{answeredCount}</strong> / {activeQuizQuestions.length}
            </div>
          </div>
        </div>

        {/* Question Display Card */}
        {currentQ && (
          <div className="card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-royal-600 bg-royal-50 px-2.5 py-1 rounded-md">
                Question {currentQuestionIndex + 1} of {activeQuizQuestions.length}
              </span>
              <span className="text-xs font-medium text-text-tertiary">
                Worth {currentQ.marks || 1} Point
              </span>
            </div>

            {/* Question Text */}
            <h3 className="text-lg sm:text-xl font-bold text-navy-900 leading-relaxed">
              {currentQ.questionText}
            </h3>

            {/* Options Grid */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              {Object.entries(currentQ.options).map(([key, optText]) => {
                const isSelected = userAnswers[currentQ.id] === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectOption(currentQ.id, key)}
                    className={`p-4 rounded-xl text-left border-2 transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-royal-500 bg-royal-50/70 shadow-sm'
                        : 'border-border-default hover:border-royal-300 hover:bg-surface-secondary/70'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-royal-600 text-white'
                        : 'bg-surface-tertiary text-text-secondary'
                    }`}>
                      {key}
                    </div>
                    <span className={`text-sm pt-0.5 leading-relaxed font-medium ${
                      isSelected ? 'text-navy-950 font-semibold' : 'text-text-primary'
                    }`}>
                      {optText}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Navigation Bottom Controls */}
            <div className="pt-6 border-t border-border-default flex items-center justify-between">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                className="btn btn-secondary btn-sm flex items-center gap-1.5 disabled:opacity-40"
              >
                <ArrowLeft size={14} /> Previous
              </button>

              <div className="flex items-center gap-3">
                {isLastQuestion ? (
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    disabled={submittingQuiz}
                    className="btn btn-primary btn-sm flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-md"
                  >
                    {submittingQuiz ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} /> Submit Quiz
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    className="btn btn-primary btn-sm flex items-center gap-1.5"
                  >
                    Next <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODE 2: LATEST COMPLETED RESULT SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  if (latestResult) {
    const passed = latestResult.passed
    const pct = latestResult.percentage

    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
        {/* Celebration / Result Header */}
        <div className={`card p-8 text-center border-t-8 ${
          passed ? 'border-t-emerald-500 bg-gradient-to-b from-emerald-50/40 to-white' : 'border-t-amber-500 bg-gradient-to-b from-amber-50/40 to-white'
        }`}>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
            passed ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
          }`}>
            {passed ? <Trophy size={36} /> : <Target size={36} />}
          </div>

          <span className="text-xs font-bold text-royal-600 uppercase tracking-widest">
            {latestResult.code || latestResult.subject}
          </span>
          <h2 className="text-2xl font-black text-navy-900 mt-1">
            {latestResult.quizTitle}
          </h2>

          <div className="my-6">
            <p className="text-5xl font-black tracking-tight text-navy-900">
              {pct}%
            </p>
            <p className="text-sm font-bold mt-1 text-text-secondary">
              Score: {latestResult.score} / {latestResult.maxScore} Points
            </p>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold mt-3 border ${
              passed
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {passed ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
              {passed ? 'Quiz Passed — Mastery Achieved!' : `Passing target is ${latestResult.passPercentage}% — Keep practicing!`}
            </span>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto pt-4 border-t border-border-default">
            <div className="p-3 rounded-xl bg-surface-secondary">
              <p className="text-xs text-text-tertiary">Correct</p>
              <p className="text-lg font-bold text-emerald-600">{latestResult.correctAnswers}</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-secondary">
              <p className="text-xs text-text-tertiary">Incorrect</p>
              <p className="text-lg font-bold text-red-500">{latestResult.incorrectAnswers}</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-secondary">
              <p className="text-xs text-text-tertiary">Unanswered</p>
              <p className="text-lg font-bold text-text-secondary">{latestResult.unanswered}</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-secondary">
              <p className="text-xs text-text-tertiary">Time Taken</p>
              <p className="text-lg font-bold text-navy-900">{formatTime(latestResult.timeTakenSeconds)}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => {
                const targetQuiz = quizzes.find(q => q.id === latestResult.quizId)
                if (targetQuiz) handleStartQuiz(targetQuiz)
              }}
              className="btn btn-secondary btn-sm flex items-center gap-1.5"
            >
              <RotateCcw size={14} /> Retake Quiz
            </button>
            <button
              onClick={() => setLatestResult(null)}
              className="btn btn-primary btn-sm flex items-center gap-1.5"
            >
              Back to Quizzes Hub <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-navy-900">
              Detailed Question Review & Explanations
            </h3>
            <span className="text-xs text-text-tertiary">All answers recorded in database</span>
          </div>

          <div className="space-y-4">
            {latestResult.breakdown?.map((item, idx) => (
              <div
                key={item.questionId || idx}
                className={`card p-5 border-l-4 ${
                  item.isCorrect ? 'border-l-emerald-500' : 'border-l-red-500'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-surface-tertiary text-navy-800">
                      Q{idx + 1}
                    </span>
                    <span className={`badge text-[11px] font-bold ${
                      item.isCorrect ? 'badge-success' : 'badge-danger'
                    }`}>
                      {item.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-navy-900">
                    {item.marks} / {item.maxMarks} pt
                  </span>
                </div>

                <p className="text-sm font-bold text-navy-900 mt-1">
                  {item.questionText}
                </p>

                {/* Options Review */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  {Object.entries(item.options || {}).map(([key, text]) => {
                    const isSelected = item.selectedOption === key
                    const isCorrectChoice = item.correctOption === key

                    let pillClass = 'bg-surface-secondary border-border-default text-text-secondary'
                    if (isCorrectChoice) {
                      pillClass = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                    } else if (isSelected && !item.isCorrect) {
                      pillClass = 'bg-red-50 border-red-300 text-red-900 line-through'
                    }

                    return (
                      <div
                        key={key}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${pillClass}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold w-5">{key}.</span>
                          <span>{text}</span>
                        </div>
                        {isCorrectChoice && <Check size={14} className="text-emerald-600 shrink-0" />}
                        {isSelected && !isCorrectChoice && <XCircle size={14} className="text-red-500 shrink-0" />}
                      </div>
                    )
                  })}
                </div>

                {/* Explanation Box */}
                {item.explanation && (
                  <div className="mt-3 p-3 rounded-xl bg-royal-50/50 border border-royal-100 text-xs">
                    <p className="font-bold text-royal-900 mb-0.5 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-royal-600" /> Concept Explanation:
                    </p>
                    <p className="text-text-secondary leading-relaxed">
                      {item.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODE 3: DEFAULT QUIZZES HUB & HISTORY
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cool Quiz Header Banner */}
      <div className="student-hero p-6 sm:p-7 text-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold badge-streak shadow-xs">
                <Zap size={13} className="text-amber-500 fill-amber-500" />
                Live Brain Gym
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold badge-level shadow-xs">
                <Sparkles size={13} className="text-purple-400" />
                Semester {semester}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
              Subject Quizzes & Knowledge Gym ⚡
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              Sharpen your core topics with timed challenges, instant score verification, and detailed concept explanations.
            </p>
          </div>
          <button
            onClick={fetchQuizzes}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all backdrop-blur-md self-start md:self-auto shrink-0"
            title="Refresh quizzes"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 border-l-4 border-l-royal-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Overall Accuracy</span>
            <div className="w-8 h-8 rounded-lg bg-royal-50 flex items-center justify-center text-royal-600">
              <Target size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-navy-900">{stats.overallAccuracy}%</p>
          <div className="mt-2 progress-bar">
            <div
              className="progress-bar-fill bg-royal-500"
              style={{ width: `${Math.min(stats.overallAccuracy, 100)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-text-tertiary mt-2">Historical attempts average</p>
        </div>

        <div className="card p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Mastered Quizzes</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-navy-900">
            {stats.passedCount} <span className="text-xs font-normal text-text-tertiary">/ {stats.totalAvailable}</span>
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-2">
            {stats.totalAvailable > 0 ? Math.round((stats.passedCount / stats.totalAvailable) * 100) : 0}% subjects cleared
          </p>
        </div>

        <div className="card p-5 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Total Attempts</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <RotateCcw size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-navy-900">{stats.totalAttempts}</p>
          <p className="text-[11px] text-purple-600 font-medium mt-2">Practice sessions logged</p>
        </div>

        <div className="card p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Curriculum Coverage</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <BookOpen size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-navy-900">{subjects.length} Subjects</p>
          <p className="text-[11px] text-amber-600 font-medium mt-2">Active syllabus</p>
        </div>
      </div>

      {/* Main Tabs (Quizzes Hub vs History) */}
      <div className="flex border-b border-border-default gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`pb-3 transition-colors relative flex items-center gap-2 ${
            activeTab === 'quizzes'
              ? 'text-royal-600 border-b-2 border-royal-600 font-extrabold'
              : 'text-text-secondary hover:text-navy-900'
          }`}
        >
          <Zap size={16} /> Available Subject Quizzes ({quizzes.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 transition-colors relative flex items-center gap-2 ${
            activeTab === 'history'
              ? 'text-royal-600 border-b-2 border-royal-600 font-extrabold'
              : 'text-text-secondary hover:text-navy-900'
          }`}
        >
          <Clock size={16} /> Quiz Results & History
        </button>
      </div>

      {/* TAB 1: AVAILABLE QUIZZES */}
      {activeTab === 'quizzes' && (
        <div className="space-y-5 animate-fade-in">
          {/* Filter Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedSubject('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedSubject === 'all'
                    ? 'bg-navy-900 text-white shadow-sm'
                    : 'bg-white border border-border-default text-text-secondary hover:bg-surface-tertiary'
                }`}
              >
                All Subjects
              </button>
              {subjects.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSubject(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    selectedSubject === s
                      ? 'bg-royal-600 text-white shadow-sm'
                      : 'bg-white border border-border-default text-text-secondary hover:bg-surface-tertiary'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="text-xs border border-border-default rounded-lg px-2.5 py-1.5 bg-white text-navy-900 focus:outline-none"
              >
                <option value="all">All Difficulties</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Quiz Cards Grid */}
          {filteredQuizzes.length === 0 ? (
            <div className="card p-12 text-center">
              <HelpCircle size={36} className="text-text-tertiary mx-auto mb-2" />
              <p className="text-sm font-semibold text-navy-900">No quizzes found for this subject filter</p>
              <button
                onClick={() => { setSelectedSubject('all'); setSelectedDifficulty('all') }}
                className="btn btn-secondary btn-sm mt-3"
              >
                Show All Quizzes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredQuizzes.map(quiz => {
                const theme = getSubjectTheme(quiz.subject)
                const hasAttempted = quiz.attemptsCount > 0

                return (
                  <div
                    key={quiz.id}
                    className="card p-5 hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between group border-border-default hover:border-royal-300"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${theme.bg}`}>
                          {quiz.code || quiz.subject}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getDifficultyBadge(quiz.difficulty)}`}>
                          {quiz.difficulty}
                        </span>
                      </div>

                      {/* Title & Topic */}
                      <h3 className="text-base font-extrabold text-navy-900 group-hover:text-royal-600 transition-colors leading-snug">
                        {quiz.title}
                      </h3>
                      {quiz.topic && (
                        <p className="text-xs font-semibold text-royal-600 mt-1">
                          Topic: {quiz.topic}
                        </p>
                      )}

                      {/* Description */}
                      <p className="text-xs text-text-secondary mt-2 line-clamp-2 leading-relaxed">
                        {quiz.description}
                      </p>

                      {/* Meta Info */}
                      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border-subtle text-center">
                        <div className="p-2 rounded-lg bg-surface-secondary">
                          <p className="text-[10px] text-text-tertiary">Questions</p>
                          <p className="text-xs font-bold text-navy-900">{quiz.questionCount} Qs</p>
                        </div>
                        <div className="p-2 rounded-lg bg-surface-secondary">
                          <p className="text-[10px] text-text-tertiary">Duration</p>
                          <p className="text-xs font-bold text-navy-900">{quiz.durationMinutes}m</p>
                        </div>
                        <div className="p-2 rounded-lg bg-surface-secondary">
                          <p className="text-[10px] text-text-tertiary">Pass Mark</p>
                          <p className="text-xs font-bold text-navy-900">{quiz.passPercentage}%</p>
                        </div>
                      </div>

                      {/* Previous Best Score pill if attempted */}
                      {hasAttempted && (
                        <div className="mt-3 flex items-center justify-between text-xs p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                          <span className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                            <Trophy size={13} className="text-emerald-600" /> Best: {quiz.bestPercentage}%
                          </span>
                          <span className="text-[10px] text-emerald-700">
                            {quiz.attemptsCount} {quiz.attemptsCount === 1 ? 'attempt' : 'attempts'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Start Quiz Action */}
                    <div className="mt-5 pt-3 border-t border-border-default">
                      <button
                        onClick={() => handleStartQuiz(quiz)}
                        className="btn btn-primary w-full text-xs font-bold flex items-center justify-center gap-2 py-2.5 shadow-sm"
                      >
                        <Zap size={14} /> {hasAttempted ? 'Retake Quiz' : 'Start Subject Quiz'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: QUIZ RESULTS & HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-6 animate-fade-in">
          {loadingHistory ? (
            <div className="space-y-4">
              <Skeleton className="h-28" />
              <Skeleton className="h-64" />
            </div>
          ) : !historyData || historyData.history?.length === 0 ? (
            <div className="card p-12 text-center">
              <Clock size={36} className="text-text-tertiary mx-auto mb-2" />
              <h4 className="text-sm font-bold text-navy-900">No past quiz attempts yet</h4>
              <p className="text-xs text-text-secondary mt-1 mb-4">
                Take any subject quiz from the Available Quizzes tab to see your answers, scores, and accuracy trends here.
              </p>
              <button
                onClick={() => setActiveTab('quizzes')}
                className="btn btn-primary btn-sm"
              >
                Go to Available Quizzes
              </button>
            </div>
          ) : (
            <>
              {/* Subject Performance Breakdown Cards */}
              {historyData.subjectStats?.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {historyData.subjectStats.map((st, i) => (
                    <div key={i} className="card p-4">
                      <p className="text-xs font-bold text-navy-900 truncate">{st.subject}</p>
                      <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl font-black text-royal-600">{st.avgScore}%</span>
                        <span className="text-xs text-text-tertiary">{st.attempts} {st.attempts === 1 ? 'try' : 'tries'}</span>
                      </div>
                      <div className="mt-2 progress-bar">
                        <div
                          className="progress-bar-fill bg-royal-500"
                          style={{ width: `${Math.min(st.avgScore, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-emerald-600 font-semibold mt-1.5">
                        Pass Rate: {st.passRate}%
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Historical Attempts Table */}
              <div className="card overflow-hidden">
                <div className="p-4 border-b border-border-default flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-navy-900">All Quiz Attempts & Stored Results</h3>
                    <p className="text-xs text-text-tertiary">Full record stored in SQLite database with individual question breakdown</p>
                  </div>
                  <span className="badge badge-info text-xs">
                    {historyData.totalAttempts} Logged Attempts
                  </span>
                </div>

                <div className="table-container border-0 rounded-none">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Quiz & Subject</th>
                        <th>Score</th>
                        <th>Percentage</th>
                        <th>Status</th>
                        <th>Time</th>
                        <th>Completed</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.history.map((att) => (
                        <tr key={att.id}>
                          <td>
                            <div>
                              <p className="font-bold text-navy-900 text-xs sm:text-sm">{att.quizTitle}</p>
                              <p className="text-[11px] text-text-tertiary">{att.subject} • {att.code}</p>
                            </div>
                          </td>
                          <td>
                            <span className="font-bold text-navy-900">{att.score}</span>
                            <span className="text-xs text-text-tertiary"> / {att.maxScore}</span>
                          </td>
                          <td>
                            <span className="font-extrabold text-royal-600">{att.percentage}%</span>
                          </td>
                          <td>
                            <span className={`badge ${att.passed ? 'badge-success' : 'badge-danger'}`}>
                              {att.passed ? 'Passed' : 'Failed'}
                            </span>
                          </td>
                          <td className="text-xs text-text-secondary">
                            {formatTime(att.timeTakenSeconds)}
                          </td>
                          <td className="text-xs text-text-secondary">
                            {att.completedAt}
                          </td>
                          <td className="text-right">
                            <button
                              onClick={() => handleViewAttemptDetail(att.id)}
                              className="btn btn-secondary btn-sm text-xs inline-flex items-center gap-1.5"
                            >
                              <Eye size={13} /> Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Modal: Past Quiz Attempt Review */}
      {selectedAttemptDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-modal max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border-default pb-3 mb-4">
              <div>
                <span className="badge badge-info text-[10px] mb-1">{selectedAttemptDetail.code || selectedAttemptDetail.subject}</span>
                <h3 className="text-base font-extrabold text-navy-900">{selectedAttemptDetail.quizTitle}</h3>
              </div>
              <button
                onClick={() => setSelectedAttemptDetail(null)}
                className="p-1 rounded-lg text-text-tertiary hover:bg-surface-tertiary"
              >
                <X size={20} />
              </button>
            </div>

            {/* Score Summary Box */}
            <div className="p-4 rounded-xl bg-surface-secondary border border-border-default flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-text-tertiary font-semibold uppercase">Attempt Result</p>
                <p className="text-2xl font-black text-navy-900 mt-0.5">
                  {selectedAttemptDetail.score} / {selectedAttemptDetail.maxScore} ({selectedAttemptDetail.percentage}%)
                </p>
              </div>
              <div className="text-right">
                <span className={`badge ${selectedAttemptDetail.passed ? 'badge-success' : 'badge-danger'} text-xs font-bold`}>
                  {selectedAttemptDetail.passed ? 'Passed' : 'Needs Practice'}
                </span>
                <p className="text-[11px] text-text-tertiary mt-1">Date: {selectedAttemptDetail.completedAt}</p>
              </div>
            </div>

            {/* Questions Breakdown list */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">Question by Question Review</h4>
              {selectedAttemptDetail.breakdown?.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border-l-4 border ${
                    item.isCorrect ? 'border-l-emerald-500 bg-white' : 'border-l-red-500 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-navy-900">Question {idx + 1}</span>
                    <span className={`badge text-[10px] ${item.isCorrect ? 'badge-success' : 'badge-danger'}`}>
                      {item.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-navy-900 leading-snug">{item.questionText}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2.5">
                    {Object.entries(item.options || {}).map(([key, text]) => {
                      const isSelected = item.selectedOption === key
                      const isCorrect = item.correctOption === key
                      let style = 'bg-surface-secondary text-text-secondary border-border-default'
                      if (isCorrect) style = 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                      else if (isSelected && !item.isCorrect) style = 'bg-red-50 text-red-900 border-red-300 line-through'

                      return (
                        <div key={key} className={`p-2 rounded text-[11px] border flex justify-between items-center ${style}`}>
                          <span><strong>{key}.</strong> {text}</span>
                          {isCorrect && <Check size={12} className="text-emerald-600" />}
                        </div>
                      )
                    })}
                  </div>

                  {item.explanation && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-royal-50/60 border border-royal-100 text-[11px] text-text-secondary">
                      <strong className="text-royal-800">Explanation: </strong> {item.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4 text-right border-t border-border-default mt-4">
              <button
                onClick={() => setSelectedAttemptDetail(null)}
                className="btn btn-secondary btn-sm text-xs"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
