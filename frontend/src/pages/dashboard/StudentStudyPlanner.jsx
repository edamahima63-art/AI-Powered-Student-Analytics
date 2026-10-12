import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { studentApi } from '../../services/api'
import { Plus, Calendar, BookOpen, Trash2, CheckCircle2, Circle, Flag, AlertTriangle, RefreshCw } from 'lucide-react'

const SUBJECTS_LIST = [
  'Mathematics', 'Data Structures', 'Algorithms', 'Database Systems',
  'Operating Systems', 'Computer Networks', 'Digital Electronics',
  'Signals & Systems', 'Circuit Analysis', 'Engineering Maths', 'Other'
]
const PRIORITIES = [
  { value: 'high',   label: 'High',   color: 'text-red-500 bg-red-50' },
  { value: 'medium', label: 'Medium', color: 'text-amber-600 bg-amber-50' },
  { value: 'low',    label: 'Low',    color: 'text-teal-600 bg-teal-50' },
]

function Skeleton({ className = '' }) {
  return <div className={`bg-border-subtle animate-pulse rounded-lg ${className}`}></div>
}

export default function StudentStudyPlanner() {
  const { user } = useAuth()
  const [tasks, setTasks]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter]     = useState('all')
  const [saving, setSaving]     = useState(false)
  const [newTask, setNewTask]   = useState({ title: '', subject: SUBJECTS_LIST[0], dueDate: '', priority: 'medium' })

  const fetchTasks = async () => {
    setLoading(true); setError(null)
    try {
      const res = await studentApi.getTasks()
      setTasks(res.tasks || [])
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { if (user) fetchTasks() }, [user?.id])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newTask.title) return
    setSaving(true)
    try {
      const created = await studentApi.createTask(newTask)
      setTasks(prev => [...prev, created])
      setNewTask({ title: '', subject: SUBJECTS_LIST[0], dueDate: '', priority: 'medium' })
      setShowForm(false)
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const toggleComplete = async (id, current) => {
    try {
      const updated = await studentApi.updateTask(id, { completed: !current })
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: updated.completed } : t))
    } catch (e) { console.error(e) }
  }

  const deleteTask = async (id) => {
    try {
      await studentApi.deleteTask(id)
      setTasks(prev => prev.filter(t => t.id !== id))
    } catch (e) { console.error(e) }
  }

  if (loading) return (
    <div className="space-y-4 animate-fade-in">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-20" />
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16" />)}
    </div>
  )

  if (error) return (
    <div className="card p-8 text-center">
      <AlertTriangle size={28} className="text-red-500 mx-auto mb-2" />
      <p className="text-sm font-semibold text-navy-900 mb-3">{error}</p>
      <button onClick={fetchTasks} className="btn btn-primary btn-sm"><RefreshCw size={14} />Retry</button>
    </div>
  )

  const filtered = tasks.filter(t => {
    if (filter === 'pending')   return !t.completed
    if (filter === 'completed') return t.completed
    return true
  }).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    const ord = { high: 0, medium: 1, low: 2 }
    return ord[a.priority] - ord[b.priority]
  })

  const completedCount = tasks.filter(t => t.completed).length
  const pct = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">Study Planner</h1>
          <p className="text-sm text-text-secondary mt-1">Your personal study tasks — saved to the database</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Progress Bar */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-navy-900">Study Progress</h3>
          <span className="text-sm font-bold text-teal-600">{completedCount}/{tasks.length} tasks</span>
        </div>
        <div className="progress-bar h-3">
          <div className="progress-bar-fill gradient-teal" style={{ width: `${pct}%` }}></div>
        </div>
        <p className="text-xs text-text-tertiary mt-2">{pct}% of your study tasks completed</p>
      </div>

      {/* Add Task Form */}
      {showForm && (
        <div className="card p-5 animate-fade-in-up border-2 border-royal-200">
          <h3 className="text-sm font-bold text-navy-900 mb-4">Add Study Task</h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Task Title *</label>
              <input type="text" value={newTask.title}
                onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Revise Chapter 5 — Process Scheduling" className="input" required />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Subject</label>
                <select value={newTask.subject} onChange={e => setNewTask(p => ({ ...p, subject: e.target.value }))} className="input">
                  {SUBJECTS_LIST.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Due Date</label>
                <input type="date" value={newTask.dueDate}
                  onChange={e => setNewTask(p => ({ ...p, dueDate: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Priority</label>
                <select value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))} className="input">
                  {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={saving} className="btn btn-primary btn-sm disabled:opacity-50">
                {saving ? 'Saving...' : 'Add Task'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost btn-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { key: 'all',       label: `All (${tasks.length})` },
          { key: 'pending',   label: `Pending (${tasks.length - completedCount})` },
          { key: 'completed', label: `Completed (${completedCount})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`btn btn-sm ${filter === f.key ? 'btn-primary' : 'btn-ghost'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Tasks */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="card p-8 text-center">
            <p className="text-text-tertiary text-sm">No tasks match this filter. Add a new task to get started.</p>
          </div>
        )}
        {filtered.map(task => {
          const priority = PRIORITIES.find(p => p.value === task.priority)
          const isOverdue = !task.completed && task.dueDate && new Date(task.dueDate) < new Date()
          return (
            <div key={task.id} className={`card p-4 flex items-start gap-3 transition-all ${task.completed ? 'opacity-60' : ''}`}>
              <button onClick={() => toggleComplete(task.id, task.completed)} className="mt-0.5 shrink-0">
                {task.completed
                  ? <CheckCircle2 size={20} className="text-teal-500" />
                  : <Circle size={20} className="text-text-tertiary hover:text-royal-500 transition-colors" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${task.completed ? 'line-through text-text-tertiary' : 'text-navy-900'}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {task.subject && (
                    <span className="flex items-center gap-1 text-xs text-text-tertiary">
                      <BookOpen size={12} /> {task.subject}
                    </span>
                  )}
                  {task.dueDate && (
                    <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500 font-semibold' : 'text-text-tertiary'}`}>
                      <Calendar size={12} />
                      {new Date(task.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      {isOverdue && ' (Overdue)'}
                    </span>
                  )}
                  <span className={`badge text-[10px] ${priority?.color}`}>
                    <Flag size={10} /> {priority?.label}
                  </span>
                </div>
              </div>
              <button onClick={() => deleteTask(task.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-text-tertiary hover:text-red-500 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
