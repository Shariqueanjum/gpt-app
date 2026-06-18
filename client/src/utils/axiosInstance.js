import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                           error.config?.url?.includes('/auth/register') ||
                           error.config?.url?.includes('/auth/forgot-password') ||
                           error.config?.url?.includes('/auth/forgot-username') ||
                           error.config?.url?.includes('/auth/reset-password') ||
                           error.config?.url?.includes('/auth/verify-email')
    
    // Only redirect on 401 if:
    // 1. It's NOT an auth endpoint (login/register/etc)
    // 2. We're NOT already on the login page
    if (error.response?.status === 401 && !isAuthEndpoint) {
      const currentPath = window.location.pathname
      if (currentPath !== '/login') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance