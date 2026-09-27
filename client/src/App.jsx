import { Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect, lazy, Suspense } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ThemeProvider, createTheme, Box, Typography, GlobalStyles } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import logo from '/images/logo.png'
import smallLogo from '/android-chrome-192x192.png'

// Public pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import CompleteProfilePage from './pages/CompleteProfilePage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ForgotUsernamePage from './pages/ForgotUsernamePage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'
import CookiePolicyPage from './pages/CookiePolicyPage'
import DisclaimerPage from './pages/DisclaimerPage'

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
const AdminAnnouncementsPage = lazy(() => import('./pages/admin/Adminannouncementspage'))
const AdminAuditLogsPage = lazy(() => import('./pages/admin/AdminAuditLogsPage'))
const AdminFraudPage = lazy(() => import('./pages/admin/AdminFraudPage'))
const AdminReversalsPage = lazy(() => import('./pages/admin/AdminReversalsPage'))
const AdminPaymentMethodsPage = lazy(() => import('./pages/admin/AdminPaymentMethodsPage'))


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

  // if (!authChecked) {
  //   return (
  //     <ThemeProvider theme={theme}>
  //       <CssBaseline />
  //       <GlobalStyles styles={{ body: { backgroundColor: theme.palette.background.default } }} />
  //       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
  //         <Box
  //           component="img"
  //           src={smallLogo}
  //           alt="Logo"
  //           sx={{
  //             width: 180,
  //             animation: "breathe 2s ease-in-out infinite",

  //             "@keyframes breathe": {
  //               "0%": {
  //                 transform: "scale(0.96)",
  //                 opacity: 0.75,
  //               },
  //               "50%": {
  //                 transform: "scale(1)",
  //                 opacity: 1,
  //               },
  //               "100%": {
  //                 transform: "scale(0.96)",
  //                 opacity: 0.75,
  //               },
  //             },
  //           }}
  //         />
  //       </Box>
  //     </ThemeProvider>
  //   )
  // }

  if (!authChecked) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <GlobalStyles
        styles={{
          body: {
            backgroundColor: theme.palette.background.default,
          },
        }}
      />

      <Box
        sx={{
          height: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Loading animation container */}
        <Box
          sx={{
            position: "relative",
            width: 220,
            height: 220,

            /* =========================
               OUTER GLOW
            ========================= */
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 18,
              borderRadius: "50%",
              border: "1px solid rgba(139, 40, 255, 0.15)",
              animation: "pulseRing 2.4s ease-in-out infinite",
            },

            /* =========================
               ROTATING ORBIT
            ========================= */
            "&::after": {
              content: '""',
              position: "absolute",
              inset: 8,
              borderRadius: "50%",
              border: "1.5px solid transparent",
              borderTopColor: "rgba(139, 40, 255, 0.75)",
              borderRightColor: "rgba(139, 40, 255, 0.25)",
              animation: "orbit 2.8s linear infinite",
            },

            "@keyframes orbit": {
              "0%": {
                transform: "rotate(0deg)",
              },
              "100%": {
                transform: "rotate(360deg)",
              },
            },

            "@keyframes pulseRing": {
              "0%, 100%": {
                transform: "scale(0.94)",
                opacity: 0.35,
              },
              "50%": {
                transform: "scale(1.06)",
                opacity: 0.8,
              },
            },

            "@keyframes logoBreathe": {
              "0%, 100%": {
                transform: "scale(0.96)",
                opacity: 0.88,
              },
              "50%": {
                transform: "scale(1)",
                opacity: 1,
              },
            },

            "@keyframes glow": {
              "0%, 100%": {
                opacity: 0.25,
                transform: "scale(0.9)",
              },
              "50%": {
                opacity: 0.55,
                transform: "scale(1.05)",
              },
            },

            "@keyframes dot1": {
              "0%": {
                transform: "rotate(0deg) translateX(92px) rotate(0deg)",
              },
              "100%": {
                transform: "rotate(360deg) translateX(92px) rotate(-360deg)",
              },
            },

            "@keyframes dot2": {
              "0%": {
                transform: "rotate(180deg) translateX(78px) rotate(-180deg)",
              },
              "100%": {
                transform: "rotate(-180deg) translateX(78px) rotate(180deg)",
              },
            },
          }}
        >
          {/* Soft glow behind logo */}
          <Box
            sx={{
              position: "absolute",
              width: 130,
              height: 130,
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(139,40,255,0.22) 0%, rgba(139,40,255,0.08) 45%, transparent 70%)",
              filter: "blur(14px)",
              animation: "glow 2.4s ease-in-out infinite",
            }}
          />

          {/* Logo */}
          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{
              position: "absolute",
              width: 145,
              height: 145,
              objectFit: "contain",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 3,

              animation:
                "logoBreathe 2.2s ease-in-out infinite",

              /* Very subtle shadow */
              filter:
                "drop-shadow(0 0 12px rgba(139, 40, 255, 0.18))",
            }}
          />

          {/* Orbiting dot 1 */}
          <Box
            sx={{
              position: "absolute",
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#8B28FF",
              left: "50%",
              top: "50%",
              marginLeft: -3.5,
              marginTop: -3.5,
              zIndex: 4,
              boxShadow: "0 0 12px rgba(139, 40, 255, 0.7)",
              animation: "dot1 3s linear infinite",
            }}
          />

          {/* Orbiting dot 2 */}
          <Box
            sx={{
              position: "absolute",
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.75)",
              left: "50%",
              top: "50%",
              marginLeft: -2,
              marginTop: -2,
              zIndex: 4,
              boxShadow: "0 0 8px rgba(255,255,255,0.5)",
              animation: "dot2 4.5s linear infinite",
            }}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
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
        <Route path="/privacy-policy"  element={<PrivacyPolicyPage />} />
        <Route path="/terms-condition" element={<TermsOfServicePage/>} />
        <Route path="/cookies" element={<CookiePolicyPage/>} />
        <Route path="/disclaimer" element={<DisclaimerPage/>} />

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

        <Route path="/admin/payment-methods" element={
          <AdminProtectedRoute>
            <Suspense fallback={<AdminPageLoader />}><AdminPaymentMethodsPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></Suspense>
          </AdminProtectedRoute>
        } />

      </Routes>
    </ThemeProvider>
  )
}

export default App