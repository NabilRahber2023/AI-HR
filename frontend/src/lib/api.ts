import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('hr-auth-storage')
    if (raw) {
      const parsed = JSON.parse(raw)
      const token = parsed?.state?.token
      if (token) config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('hr-auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  signup: (data: { full_name: string; email: string; password: string; role: string }) =>
    api.post('/auth/signup', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

export const analyticsAPI = {
  summary: () => api.get('/analytics/summary'),
  salaryDist: () => api.get('/analytics/salary-distribution'),
  deptPerf: () => api.get('/analytics/department-performance'),
  nineboxDist: () => api.get('/analytics/9box-distribution'),
  genderDist: () => api.get('/analytics/gender-distribution'),
  perfDist: () => api.get('/analytics/performance-distribution'),
}

export const employeesAPI = {
  list: (skip = 0, limit = 50) => api.get(`/employees?skip=${skip}&limit=${limit}`),
  get: (id: number) => api.get(`/employees/${id}`),
  search: (q: string) => api.get(`/employees/search?q=${encodeURIComponent(q)}`),
  uploadCSV: (formData: FormData) =>
    api.post('/employees/upload-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

export const predictionAPI = {
  train: () => api.post('/prediction/train'),
  forEmployee: (id: number) => api.get(`/prediction/employee/${id}`),
  custom: (data: Record<string, unknown>) => api.post('/prediction/custom', data),
  metrics: () => api.get('/prediction/metrics'),
}

export const recommendationAPI = {
  get: (id: number) => api.get(`/recommendation/${id}`),
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('hr-auth-storage')
    return raw ? JSON.parse(raw)?.state?.token ?? null : null
  } catch {
    return null
  }
}

export const chatbotAPI = {
  chat: (message: string, context: Record<string, unknown> | null = null) =>
    api.post('/chat/chat', { message, employee_context: context }),
  history: () => api.get('/chat/history'),
  /**
   * Stream a chat reply, invoking onToken with the accumulated text as
   * tokens arrive. Returns the full final text. Falls back to throwing on
   * network/auth failure so callers can show an error bubble.
   */
  stream: async (
    message: string,
    context: Record<string, unknown> | null,
    onToken: (accumulated: string) => void,
  ): Promise<string> => {
    const token = getAuthToken()
    const res = await fetch(`${API_BASE}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message, employee_context: context }),
    })
    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('hr-auth-storage')
        window.location.href = '/login'
      }
      throw new Error('Unauthorized')
    }
    if (!res.ok || !res.body) throw new Error(`Chat request failed (${res.status})`)

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let full = ''
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      full += decoder.decode(value, { stream: true })
      onToken(full)
    }
    full += decoder.decode()
    onToken(full)
    return full
  },
}

export default api
