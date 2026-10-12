import React, { useState } from 'react'
import { CheckCircle2, AlertTriangle, Lightbulb, CheckCheck } from 'lucide-react'

const NOTIFICATIONS = [
  { id: 1, type: 'warning', title: 'Attendance Below Target', message: 'Your attendance has dropped to 87%. Target is 90%. Attend all classes this week.', time: '2 hours ago', read: false },
  { id: 2, type: 'info', title: '3 New Recommendations Available', message: 'Based on your recent performance, 3 personalized study recommendations have been added.', time: '1 day ago', read: false },
  { id: 3, type: 'success', title: 'Assignment Submitted Successfully', message: 'Your DBMS ER Diagram assignment has been received by Prof. Desai.', time: '2 days ago', read: true },
  { id: 4, type: 'warning', title: 'Upcoming Exam Reminder', message: 'Algorithms Mid-Term is in 6 days. Check the study plan section for preparation tips.', time: '2 days ago', read: true },
  { id: 5, type: 'info', title: 'Study Plan Updated', message: 'Your study planner has been updated with new tasks based on upcoming deadlines.', time: '3 days ago', read: true },
]

const ICONS = { warning: AlertTriangle, info: Lightbulb, success: CheckCircle2 }
const COLORS = { warning: 'text-amber-500 bg-amber-50', info: 'text-royal-500 bg-royal-50', success: 'text-teal-500 bg-teal-50' }

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(NOTIFICATIONS)
  const markRead = (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  const markAll = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  const unread = notifs.filter(n => !n.read).length
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">Notifications</h1>
          <p className="text-sm text-text-secondary mt-1">{unread} unread notifications</p>
        </div>
        {unread > 0 && <button onClick={markAll} className="btn btn-sm btn-ghost"><CheckCheck size={14} />Mark all read</button>}
      </div>
      <div className="space-y-2">
        {notifs.map(n => {
          const Icon = ICONS[n.type]
          const colorClass = COLORS[n.type]
          return (
            <div key={n.id} onClick={() => markRead(n.id)} className={`card p-4 cursor-pointer transition-all ${!n.read ? 'border-royal-200 bg-royal-50/30' : ''}`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-semibold ${!n.read ? 'text-navy-900' : 'text-text-primary'}`}>{n.title}</p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-royal-500 shrink-0"></span>}
                  </div>
                  <p className="text-xs text-text-secondary mt-1">{n.message}</p>
                  <p className="text-xs text-text-tertiary mt-2">{n.time}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
