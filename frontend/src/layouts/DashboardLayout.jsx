import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, BookOpen, TrendingUp, CalendarCheck, Lightbulb,
  Users, ClipboardList, CheckSquare, AlertTriangle,
  GraduationCap, Building2, FileText, Upload, Settings, Bell,
  LogOut, Menu, X, ChevronDown, Database,
  Award, HelpCircle, Flame
} from 'lucide-react'

const ROLE_NAV = {
  student: [
    { to: '/dashboard/overview', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/subjects', icon: BookOpen, label: 'Subjects' },
    { to: '/dashboard/assessments', icon: Award, label: 'Assessments' },
    { to: '/dashboard/quizzes', icon: HelpCircle, label: 'Subject Quizzes' },
    { to: '/dashboard/progress', icon: TrendingUp, label: 'Progress' },
    { to: '/dashboard/study-planner', icon: CalendarCheck, label: 'Study Planner' },
    { to: '/dashboard/recommendations', icon: Lightbulb, label: 'Recommendations' },
  ],
  faculty: [
    { to: '/dashboard/faculty', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/faculty/classes', icon: Users, label: 'My Classes' },
    { to: '/dashboard/faculty/attendance', icon: ClipboardList, label: 'Attendance' },
    { to: '/dashboard/faculty/marks', icon: CheckSquare, label: 'Assessments' },
    { to: '/dashboard/faculty/alerts', icon: AlertTriangle, label: 'Alerts' },
    { to: '/dashboard/faculty/data', icon: Database, label: 'Data Management' },
  ],
  admin: [
    { to: '/dashboard/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/admin/students', icon: GraduationCap, label: 'Students' },
    { to: '/dashboard/admin/faculty', icon: Users, label: 'Faculty' },
    { to: '/dashboard/admin/departments', icon: Building2, label: 'Departments' },
    { to: '/dashboard/admin/reports', icon: FileText, label: 'Reports' },
    { to: '/dashboard/admin/import', icon: Upload, label: 'Import Data' },
    { to: '/dashboard/admin/data', icon: Database, label: 'Data Management' },
  ],
}

const ROLE_LABELS = {
  student: 'Student',
  faculty: 'Faculty',
  admin: 'Administrator',
}

const ROLE_COLORS = {
  student: 'bg-royal-500',
  faculty: 'bg-teal-500',
  admin: 'bg-navy-700',
}

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const navItems = ROLE_NAV[user?.role] || []

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-transparent flex relative z-10">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-navy-950/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-gradient-to-b from-white/95 via-indigo-50/40 to-purple-50/30 backdrop-blur-2xl border-r border-indigo-100/80 shadow-lg shadow-indigo-500/5
        flex flex-col transition-transform duration-300 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-border-default shrink-0">
          <div className="w-9 h-9 gradient-electric rounded-xl flex items-center justify-center shadow-sm">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-navy-900 tracking-tight font-display">EduInsight</h1>
            <p className="text-[10px] text-royal-600 font-semibold tracking-wide uppercase">Student Success AI</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden p-1.5 rounded-lg hover:bg-surface-tertiary"
          >
            <X size={18} />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-4 py-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${ROLE_COLORS[user?.role]}`}></span>
            <span className="text-xs font-semibold text-text-secondary">
              {ROLE_LABELS[user?.role]}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <ul className="space-y-0.5">
            {navItems.map(item => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/dashboard/overview' || item.to === '/dashboard/faculty' || item.to === '/dashboard/admin'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                    transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-royal-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
                      : 'text-slate-600 hover:bg-white/80 hover:text-royal-700 hover:shadow-xs'
                    }
                  `}
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mt-6 pt-4 border-t border-border-subtle">
            <ul className="space-y-0.5">
              <li>
                <NavLink
                  to="/dashboard/notifications"
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                    ${isActive
                      ? 'bg-gradient-to-r from-royal-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                      : 'text-slate-600 hover:bg-white/80 hover:text-royal-700'
                    }
                  `}
                >
                  <Bell size={18} />
                  Notifications
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/dashboard/settings"
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                    ${isActive
                      ? 'bg-gradient-to-r from-royal-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                      : 'text-slate-600 hover:bg-white/80 hover:text-royal-700'
                    }
                  `}
                >
                  <Settings size={18} />
                  Settings
                </NavLink>
              </li>
            </ul>
          </div>
        </nav>

        {/* User profile */}
        <div className="p-3 border-t border-border-default shrink-0">
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-tertiary transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center">
                <span className="text-xs font-bold text-navy-700">
                  {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{user?.name}</p>
                <p className="text-xs text-text-tertiary truncate">{user?.email}</p>
              </div>
              <ChevronDown size={14} className={`text-text-tertiary transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-xl shadow-modal border border-border-default p-1 animate-fade-in z-10">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-gradient-to-r from-white/90 via-indigo-50/60 to-purple-50/40 backdrop-blur-2xl border-b border-indigo-100/90 flex items-center px-4 lg:px-6 shrink-0 sticky top-0 z-30 shadow-xs">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-surface-tertiary mr-3"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1">
            <h2 className="text-lg font-extrabold text-navy-900 font-display">
              {navItems.find(n => location.pathname.startsWith(n.to))?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {user?.role === 'student' && (
              <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold badge-streak mr-1 shadow-xs">
                <Flame size={13} className="text-orange-500 fill-orange-500 animate-pulse" />
                <span>5-Day Streak</span>
              </div>
            )}

            <button
              onClick={() => navigate('/dashboard/notifications')}
              className="p-2 rounded-xl hover:bg-surface-tertiary relative transition-colors"
              aria-label="View notifications"
            >
              <Bell size={18} className="text-text-secondary" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="hidden sm:flex items-center gap-2.5 ml-1 pl-3 border-l border-border-default">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-royal-500 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                <span className="text-xs font-bold">
                  {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-navy-900 leading-tight">{user?.name?.split(' ')[0]}</span>
                <span className="text-[10px] text-text-tertiary capitalize">{user?.role}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 ml-2 rounded-xl text-xs sm:text-sm font-bold text-red-600 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 shadow-xs transition-all duration-150"
              title="Sign Out"
              id="topbar-signout-btn"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main id="main-content" className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
