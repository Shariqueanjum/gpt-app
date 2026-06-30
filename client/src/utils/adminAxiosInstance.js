import axios from 'axios'

// Separate axios instance for admin API calls.
// Admin auth is fully independent from user auth — different token,
// different storage key, different backend secret (ADMIN_JWT_SECRET).
const adminAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

adminAxiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

adminAxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginEndpoint = error.config?.url?.includes('/admin/login')

    if (error.response?.status === 401 && !isLoginEndpoint) {
      const currentPath = window.location.pathname
      if (currentPath !== '/admin/login') {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

export default adminAxiosInstance