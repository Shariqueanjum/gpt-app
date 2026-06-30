import { Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect, lazy, Suspense } from 'react'
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
import NotificationsPage from './pages/NotificationsPage'

// Admin pages — lazy loaded so admin code (and recharts) never ships in the
// public bundle a normal user downloads.
import AdminLoginPage from './pages/admin/AdminLoginPage'
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'))
const AdminWithdrawalsPage = lazy(() => import('./pages/admin/AdminWithdrawalsPage'))
const AdminTicketsPage = lazy(() => import('./pages/admin/AdminTicketsPage'))
const AdminOfferWallsPage = lazy(() => import('./pages/admin/AdminOfferWallsPage'))
// const AdminTransactionsPage = lazy(() => import('./pages/admin/AdminTransactionsPage'))
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'))
const AdminPaymentProofsPage = lazy(() => import('./pages/admin/AdminPaymentProofsPage'))
const AdminTrafficLogsPage = lazy(() => import('./pages/admin/AdminTrafficLogsPage'))
const AdminAnnouncementsPage = lazy(() => import('./pages/admin/AdminAnnouncementsPage'))
const AdminAuditLogsPage = lazy(() => import('./pages/admin/AdminAuditLogsPage'))
const AdminFraudPage = lazy(() => import('./pages/admin/AdminFraudPage'))
const AdminReversalsPage = lazy(() => import('./pages/admin/AdminReversalsPage'))


// import AdminUsersPage from './pages/admin/AdminUsersPage'
// import AdminWithdrawalsPage from './pages/admin/AdminWithdrawalsPage'
// import AdminTicketsPage from './pages/admin/AdminTicketsPage'
// import AdminOfferWallsPage from './pages/admin/AdminOfferWallsPage'
// import AdminTransactionsPage from './pages/admin/AdminTransactionsPage'
// import AdminSettingsPage from './pages/admin/AdminSettingsPage'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import PublicOnlyRoute from './components/PublicOnlyRoute'
import { fetchCurrentUser, restoreAuth } from './slices/authSlice'
import { restoreAdminAuth } from './slices/adminAuthSlice'

const AdminPageLoader = () => (
  <Box sx={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    bgcolor: '#0d0a1f',
  }}>
    <Box sx={{
      width: 36, height: 36, borderRadius: '50%',
      border: '3px solid rgba(255,255,255,0.12)', borderTopColor: '#8b5cf6',
      animation: 'admin-spin 0.8s linear infinite',
    }} />
    <GlobalStyles styles={{ '@keyframes admin-spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } } }} />
  </Box>
)

const AUTH_MODAL_ROUTES = ['/login', '/register', '/forgot-password', '/forgot-username']

function App() {
  const dispatch = useDispatch()
  const location = useLocation()
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  const [darkMode, setDarkMode] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  // Check if current route is an auth modal route
  const isAuthModalRoute = AUTH_MODAL_ROUTES.includes(location.pathname)

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
    dispatch(restoreAdminAuth())
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
      {/* Background layer: Render HomePage behind auth modals */}
      {isAuthModalRoute && (
        <Box sx={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}>
          <Box sx={{ height: '100%', overflow: 'auto' }}>
            <HomePage />
          </Box>
        </Box>
      )}
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

        <Route path="/notifications" element={
          <ProtectedRoute requireProfile={true}>
            <NotificationsPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </ProtectedRoute>} />
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={
          <AdminProtectedRoute>
            <Suspense fallback={<AdminPageLoader />}><AdminDashboardPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></Suspense>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <AdminProtectedRoute>
            <Suspense fallback={<AdminPageLoader />}><AdminUsersPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></Suspense>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/withdrawals" element={
          <AdminProtectedRoute>
            <Suspense fallback={<AdminPageLoader />}><AdminWithdrawalsPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></Suspense>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/tickets" element={
          <AdminProtectedRoute>
            <Suspense fallback={<AdminPageLoader />}><AdminTicketsPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></Suspense>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/offer-walls" element={
          <AdminProtectedRoute>
            <Suspense fallback={<AdminPageLoader />}><AdminOfferWallsPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></Suspense>
          </AdminProtectedRoute>
        } />
        {/* <Route path="/admin/transactions" element={
          <AdminProtectedRoute>
            <Suspense fallback={<AdminPageLoader />}><AdminTransactionsPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></Suspense>
          </AdminProtectedRoute>
        } /> */}
        <Route path="/admin/settings" element={
          <AdminProtectedRoute>
            <Suspense fallback={<AdminPageLoader />}><AdminSettingsPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></Suspense>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/payment-proofs" element={
          <AdminProtectedRoute>
            <Suspense fallback={<AdminPageLoader />}><AdminPaymentProofsPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></Suspense>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/traffic-logs" element={
          <AdminProtectedRoute>
            <Suspense fallback={<AdminPageLoader />}><AdminTrafficLogsPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></Suspense>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/announcements" element={
          <AdminProtectedRoute>
            <Suspense fallback={<AdminPageLoader />}><AdminAnnouncementsPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></Suspense>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/audit-logs" element={
          <AdminProtectedRoute>
            <Suspense fallback={<AdminPageLoader />}><AdminAuditLogsPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></Suspense>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/fraud" element={
          <AdminProtectedRoute>
            <Suspense fallback={<AdminPageLoader />}><AdminFraudPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></Suspense>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/reversals" element={
          <AdminProtectedRoute>
            <Suspense fallback={<AdminPageLoader />}><AdminReversalsPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></Suspense>
          </AdminProtectedRoute>
        } />
       
      </Routes>
    </ThemeProvider>
  )
}

export default App