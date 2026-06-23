import { Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ThemeProvider, createTheme, Box, Typography, GlobalStyles } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'

// Public pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import CompleteProfilePage from './pages/CompleteProfilePage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ForgotUsernamePage from './pages/ForgotUsernamePage'

// Dashboard & protected pages
import DashboardPage from './pages/DashboardPage'
import EarnPage from './pages/EarnPage'
import WithdrawPage from './pages/WithdrawPage'
import HistoryPage from './pages/HistoryPage'
import ReferralsPage from './pages/ReferralsPage'
import SupportPage from './pages/SupportPage'
import ProfilePage from './pages/ProfilePage'
import ProgressPage from './pages/ProgressPage'

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminWithdrawalsPage from './pages/admin/AdminWithdrawalsPage'
import AdminTicketsPage from './pages/admin/AdminTicketsPage'
import AdminOfferWallsPage from './pages/admin/AdminOfferWallsPage'
import AdminTransactionsPage from './pages/admin/AdminTransactionsPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import PublicOnlyRoute from './components/PublicOnlyRoute'
import { fetchCurrentUser, restoreAuth } from './slices/authSlice'

function App() {
  const dispatch = useDispatch()
  const location = useLocation()
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  const [darkMode, setDarkMode] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      dispatch(restoreAuth())
      dispatch(fetchCurrentUser()).finally(() => {
        setAuthChecked(true)
      })
    } else {
      setAuthChecked(true)
    }
  }, [dispatch])

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1))
      if (element) {
        setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    }
  }, [location])

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#10b981' },
      secondary: { main: '#0f172a' },
      background: {
        default: darkMode ? '#0f172a' : '#f8fafc',
        paper: darkMode ? '#1e293b' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
  })

  const toggleDarkMode = () => setDarkMode(!darkMode)

  if (!authChecked) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles styles={{ body: { backgroundColor: theme.palette.background.default } }} />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <Typography>Loading...</Typography>
        </Box>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={{ body: { backgroundColor: theme.palette.background.default } }} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/complete-profile" element={<ProtectedRoute requireProfile={false}><CompleteProfilePage /></ProtectedRoute>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/forgot-username" element={<ForgotUsernamePage />} />

        {/* Protected User Routes (require profile completion) */}
        <Route path="/dashboard" element={
          <ProtectedRoute requireProfile={true}>
            <DashboardPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </ProtectedRoute>
        } />
        <Route path="/earn" element={
          <ProtectedRoute requireProfile={true}>
            <EarnPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </ProtectedRoute>
        } />
        <Route path="/withdraw" element={
          <ProtectedRoute requireProfile={true}>
            <WithdrawPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute requireProfile={true}>
            <HistoryPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </ProtectedRoute>
        } />
        <Route path="/referrals" element={
          <ProtectedRoute requireProfile={true}>
            <ReferralsPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </ProtectedRoute>
        } />
        <Route path="/support" element={
          <ProtectedRoute requireProfile={true}>
            <SupportPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute requireProfile={true}>
            <ProfilePage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute requireProfile={true}>
            <ProfilePage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </ProtectedRoute>
        } />

        <Route path="/progress" element={
          <ProtectedRoute requireProfile={true}>
            <ProgressPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboardPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute adminOnly={true}>
            <AdminUsersPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </ProtectedRoute>
        } />
        <Route path="/admin/withdrawals" element={
          <ProtectedRoute adminOnly={true}>
            <AdminWithdrawalsPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </ProtectedRoute>
        } />
        <Route path="/admin/tickets" element={
          <ProtectedRoute adminOnly={true}>
            <AdminTicketsPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </ProtectedRoute>
        } />
        <Route path="/admin/offer-walls" element={
          <ProtectedRoute adminOnly={true}>
            <AdminOfferWallsPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </ProtectedRoute>
        } />
        <Route path="/admin/transactions" element={
          <ProtectedRoute adminOnly={true}>
            <AdminTransactionsPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute adminOnly={true}>
            <AdminSettingsPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </ProtectedRoute>
        } />
      </Routes>
    </ThemeProvider>
  )
}

export default App