import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import adminAxiosInstance from '../utils/adminAxiosInstance'

const adminToken = localStorage.getItem('adminToken')
const savedAdmin = localStorage.getItem('adminUser')

const initialState = {
  admin: savedAdmin ? JSON.parse(savedAdmin) : null,
  token: adminToken || null,
  isAdminAuthenticated: !!adminToken,
  loading: false,
  error: null,
}

export const loginAdmin = createAsyncThunk(
  'adminAuth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await adminAxiosInstance.post('/admin/login', credentials)
      const { token, admin } = response.data
      localStorage.setItem('adminToken', token)
      localStorage.setItem('adminUser', JSON.stringify(admin))
      return { token, admin }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

export const fetchCurrentAdmin = createAsyncThunk(
  'adminAuth/fetchCurrentAdmin',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAxiosInstance.get('/admin/me')
      const admin = response.data.admin
      localStorage.setItem('adminUser', JSON.stringify(admin))
      return admin
    } catch (error) {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      return rejectWithValue(error.response?.data?.message || 'Admin session expired')
    }
  }
)

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null
    },
    restoreAdminAuth: (state) => {
      const token = localStorage.getItem('adminToken')
      const admin = localStorage.getItem('adminUser')
      if (token && admin) {
        state.token = token
        state.admin = JSON.parse(admin)
        state.isAdminAuthenticated = true
      }
    },
    logoutAdmin: (state) => {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      state.admin = null
      state.token = null
      state.isAdminAuthenticated = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false
        state.isAdminAuthenticated = true
        state.admin = action.payload.admin
        state.token = action.payload.token
        state.error = null
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAdminAuthenticated = false
      })
      .addCase(fetchCurrentAdmin.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchCurrentAdmin.fulfilled, (state, action) => {
        state.loading = false
        state.admin = action.payload
        state.isAdminAuthenticated = true
      })
      .addCase(fetchCurrentAdmin.rejected, (state) => {
        state.loading = false
        state.isAdminAuthenticated = false
        state.admin = null
        state.token = null
      })
  },
})

export const { clearAdminError, restoreAdminAuth, logoutAdmin } = adminAuthSlice.actions
export default adminAuthSlice.reducer