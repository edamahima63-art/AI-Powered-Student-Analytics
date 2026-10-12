/**
 * API Service — all requests use the JWT Bearer token from AuthContext.
 * Student data endpoints NEVER pass a student ID in the URL.
 * The backend resolves identity from the JWT.
 */

const API_BASE = '/api'

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

function getToken() {
  return localStorage.getItem('eduinsight_token')
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const token = getToken()

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new ApiError(errData.detail || `Request failed (${response.status})`, response.status)
    }
    if (response.headers.get('content-type')?.includes('text/csv')) {
      return response.blob()
    }
    if (response.status === 204) return null
    return response.json()
  } catch (err) {
    if (err instanceof ApiError) throw err
    throw new ApiError('Unable to connect to server. Is the backend running?', 0)
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login:    (email, password) => request('/auth/login',    { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data)            => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  me:       ()                => request('/auth/me'),
  logout:   ()                => request('/auth/logout',   { method: 'POST' }),
}

// ── Student (all scoped to authenticated user via JWT — no student ID in URL) ─
export const studentApi = {
  dashboard:       ()           => request('/student/dashboard'),
  results:         ()           => request('/student/results'),
  attendance:      ()           => request('/student/attendance'),
  progress:        ()           => request('/student/progress'),
  recommendations: ()           => request('/student/recommendations'),
  risk:            ()           => request('/student/risk'),

  // Study tasks — CRUD, persisted in DB per user
  getTasks:   ()          => request('/student/study-tasks'),
  createTask: (data)      => request('/student/study-tasks',       { method: 'POST',  body: JSON.stringify(data) }),
  updateTask: (id, data)  => request(`/student/study-tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTask: (id)        => request(`/student/study-tasks/${id}`, { method: 'DELETE' }),

  // Notifications
  getNotifications: ()   => request('/student/notifications'),
  markRead:         (id) => request(`/student/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead:      ()   => request('/student/notifications/read-all',   { method: 'PATCH' }),

  // Recommendations
  updateRecommendation: (id, data) => request(`/student/recommendations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Assessments
  getAssessments:   ()             => request('/student/assessments'),
  submitAssessment: (id, data)     => request(`/student/assessments/${id}/submit`, { method: 'POST', body: JSON.stringify(data) }),

  // Quizzes & Results
  getQuizzes:       ()             => request('/student/quizzes'),
  getQuiz:          (id)           => request(`/student/quizzes/${id}`),
  submitQuiz:       (id, data)     => request(`/student/quizzes/${id}/submit`, { method: 'POST', body: JSON.stringify(data) }),
  getQuizHistory:   ()             => request('/student/quizzes/results/history'),
  getQuizAttempt:   (id)           => request(`/student/quizzes/results/${id}`),
}

// ── Faculty ───────────────────────────────────────────────────────────────────
export const facultyApi = {
  getClasses:         ()     => request('/faculty/classes'),
  getAlerts:          ()     => request('/faculty/alerts'),
  recordAttendance:   (data) => request('/faculty/attendance', { method: 'POST', body: JSON.stringify(data) }),
  recordMarks:        (data) => request('/faculty/marks',      { method: 'POST', body: JSON.stringify(data) }),
}

// ── Management (faculty + admin data entry) ───────────────────────────────────
export const manageApi = {
  listStudents:         ()             => request('/manage/students'),
  getStudentRecs:       (email)        => request(`/manage/students/${encodeURIComponent(email)}/records`),
  addMarks:             (data)         => request('/manage/marks',           { method: 'POST',   body: JSON.stringify(data) }),
  updateMarks:          (id, data)     => request(`/manage/marks/${id}`,     { method: 'PUT',    body: JSON.stringify(data) }),
  deleteMarks:          (id)           => request(`/manage/marks/${id}`,     { method: 'DELETE' }),
  addAttendance:        (data)         => request('/manage/attendance',      { method: 'POST',   body: JSON.stringify(data) }),
  updateAttendance:     (id, data)     => request(`/manage/attendance/${id}`,{ method: 'PUT',    body: JSON.stringify(data) }),
  deleteAttendance:     (id)           => request(`/manage/attendance/${id}`,{ method: 'DELETE' }),
  addRecommendation:    (data)         => request('/manage/recommendations', { method: 'POST',   body: JSON.stringify(data) }),
  updateRecommendation: (id, data)     => request(`/manage/recommendations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRecommendation: (id)           => request(`/manage/recommendations/${id}`, { method: 'DELETE' }),
  setRisk:              (data)         => request('/manage/risk',            { method: 'POST',   body: JSON.stringify(data) }),
  sendNotification:     (data)         => request('/manage/notify',          { method: 'POST',   body: JSON.stringify(data) }),
  updateSemester:       (email, sem)   => request(`/manage/students/${encodeURIComponent(email)}/semester`,
                                                  { method: 'PATCH', body: JSON.stringify({ semester: sem }) }),
  updateStudentProfile: (email, data)  => request(`/manage/students/${encodeURIComponent(email)}/profile`,
                                                  { method: 'PUT', body: JSON.stringify(data) }),
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  getDashboard: () => request('/admin/dashboard'),
  getUsers:     () => request('/admin/users'),
}

// ── Legacy export aliases (for any components that import the old API shape) ──
export const studentsApi = studentApi
export const analyticsApi = { overview: () => request('/admin/dashboard') }
export const studyPlanApi = {
  list:   ()        => studentApi.getTasks(),
  create: (data)    => studentApi.createTask(data),
  update: (id, data)=> studentApi.updateTask(id, data),
  delete: (id)      => studentApi.deleteTask(id),
}
export const notificationsApi = {
  list:       () => studentApi.getNotifications(),
  markRead:   (id) => studentApi.markRead(id),
  markAllRead: () => studentApi.markAllRead(),
}
