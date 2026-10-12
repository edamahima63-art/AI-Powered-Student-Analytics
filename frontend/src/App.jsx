import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

// Layouts
import PublicLayout from './layouts/PublicLayout'
import DashboardLayout from './layouts/DashboardLayout'

// Public Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// Dashboard Pages
import StudentDashboard from './pages/dashboard/StudentDashboard'
import StudentSubjects from './pages/dashboard/StudentSubjects'
import StudentAssessments from './pages/dashboard/StudentAssessments'
import StudentQuizzes from './pages/dashboard/StudentQuizzes'
import StudentProgress from './pages/dashboard/StudentProgress'
import StudentStudyPlanner from './pages/dashboard/StudentStudyPlanner'
import StudentRecommendations from './pages/dashboard/StudentRecommendations'

import FacultyDashboard from './pages/dashboard/FacultyDashboard'
import FacultyClasses from './pages/dashboard/FacultyClasses'
import FacultyAttendance from './pages/dashboard/FacultyAttendance'
import FacultyMarks from './pages/dashboard/FacultyMarks'
import FacultyAlerts from './pages/dashboard/FacultyAlerts'
import FacultyDataManagement from './pages/dashboard/FacultyDataManagement'

import AdminDashboard from './pages/dashboard/AdminDashboard'
import AdminStudents from './pages/dashboard/AdminStudents'
import AdminFaculty from './pages/dashboard/AdminFaculty'
import AdminDepartments from './pages/dashboard/AdminDepartments'
import AdminReports from './pages/dashboard/AdminReports'
import AdminImport from './pages/dashboard/AdminImport'

import NotificationsPage from './pages/dashboard/NotificationsPage'
import SettingsPage from './pages/dashboard/SettingsPage'

// Protected Route wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-secondary">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-royal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary text-sm">Loading...</p>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

// Redirect to role-appropriate dashboard
function DashboardRedirect() {
  const { user } = useAuth()
  
  const roleRoutes = {
    student: '/dashboard/overview',
    faculty: '/dashboard/faculty',
    admin: '/dashboard/admin',
  }
  
  return <Navigate to={roleRoutes[user?.role] || '/dashboard/overview'} replace />
}

export default function App() {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Global Animated Aurora & Ambient Background Layer */}
      <div className="animated-bg-container" aria-hidden="true">
        <div className="aurora-orb aurora-orb-1"></div>
        <div className="aurora-orb aurora-orb-2"></div>
        <div className="aurora-orb aurora-orb-3"></div>
        <div className="aurora-orb aurora-orb-4"></div>
        <div className="aurora-orb aurora-orb-5"></div>
        <div className="aurora-grid"></div>
      </div>

      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardRedirect />} />
          
          {/* Student Routes */}
          <Route path="overview" element={
            <ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>
          } />
          <Route path="subjects" element={
            <ProtectedRoute allowedRoles={['student']}><StudentSubjects /></ProtectedRoute>
          } />
          <Route path="assessments" element={
            <ProtectedRoute allowedRoles={['student']}><StudentAssessments /></ProtectedRoute>
          } />
          <Route path="quizzes" element={
            <ProtectedRoute allowedRoles={['student']}><StudentQuizzes /></ProtectedRoute>
          } />
          <Route path="progress" element={
            <ProtectedRoute allowedRoles={['student']}><StudentProgress /></ProtectedRoute>
          } />
          <Route path="study-planner" element={
            <ProtectedRoute allowedRoles={['student']}><StudentStudyPlanner /></ProtectedRoute>
          } />
          <Route path="recommendations" element={
            <ProtectedRoute allowedRoles={['student']}><StudentRecommendations /></ProtectedRoute>
          } />

          {/* Faculty Routes */}
          <Route path="faculty" element={
            <ProtectedRoute allowedRoles={['faculty']}><FacultyDashboard /></ProtectedRoute>
          } />
          <Route path="faculty/classes" element={
            <ProtectedRoute allowedRoles={['faculty']}><FacultyClasses /></ProtectedRoute>
          } />
          <Route path="faculty/attendance" element={
            <ProtectedRoute allowedRoles={['faculty']}><FacultyAttendance /></ProtectedRoute>
          } />
          <Route path="faculty/marks" element={
            <ProtectedRoute allowedRoles={['faculty']}><FacultyMarks /></ProtectedRoute>
          } />
          <Route path="faculty/alerts" element={
            <ProtectedRoute allowedRoles={['faculty']}><FacultyAlerts /></ProtectedRoute>
          } />
          <Route path="faculty/data" element={
            <ProtectedRoute allowedRoles={['faculty', 'admin']}><FacultyDataManagement /></ProtectedRoute>
          } />
          {/* Admin can also access data management directly */}
          <Route path="admin/data" element={
            <ProtectedRoute allowedRoles={['admin']}><FacultyDataManagement /></ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="admin" element={
            <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="admin/students" element={
            <ProtectedRoute allowedRoles={['admin']}><AdminStudents /></ProtectedRoute>
          } />
          <Route path="admin/faculty" element={
            <ProtectedRoute allowedRoles={['admin']}><AdminFaculty /></ProtectedRoute>
          } />
          <Route path="admin/departments" element={
            <ProtectedRoute allowedRoles={['admin']}><AdminDepartments /></ProtectedRoute>
          } />
          <Route path="admin/reports" element={
            <ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>
          } />
          <Route path="admin/import" element={
            <ProtectedRoute allowedRoles={['admin']}><AdminImport /></ProtectedRoute>
          } />

          {/* Shared Routes */}
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
