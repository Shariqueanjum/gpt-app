import { Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ThemeProvider, createTheme, Box, Typography, GlobalStyles } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import CompleteProfilePage from './pages/CompleteProfilePage'
import DashboardPage from './pages/DashboardPage'
import DashboardLayout from './components/Layout/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'
import PublicOnlyRoute from './components/PublicOnlyRoute'
import { fetchCurrentUser, restoreAuth } from './slices/authSlice'

function App() {
  const dispatch = useDispatch()
  const location = useLocation()
  const { isAuthenticated } = useSelector((state) => state.auth)
  
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
        <GlobalStyles styles={{ body: { bgcolor: theme.palette.background.default } }} />
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" sx={{ color: '#64748b' }}>Loading...</Typography>
        </Box>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          body: {
            backgroundColor: theme.palette.background.default,
            transition: 'background-color 0.3s ease',
          },
          html: {
            backgroundColor: theme.palette.background.default,
            transition: 'background-color 0.3s ease',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <>
                <HomePage />
                <LoginPage />
              </>
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <>
                <HomePage />
                <RegisterPage />
              </>
            </PublicOnlyRoute>
          }
        />
        
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        
        <Route
          path="/complete-profile"
          element={
            <ProtectedRoute>
              <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                <DashboardPage />
                <CompleteProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireProfile>
              <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                <DashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/earn"
          element={
            <ProtectedRoute requireProfile>
              <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                <Box sx={{ p: 4 }}><Typography>Earn Page - Coming Soon</Typography></Box>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/withdraw"
          element={
            <ProtectedRoute requireProfile>
              <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                <Box sx={{ p: 4 }}><Typography>Withdraw Page - Coming Soon</Typography></Box>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/referrals"
          element={
            <ProtectedRoute requireProfile>
              <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                <Box sx={{ p: 4 }}><Typography>Referrals Page - Coming Soon</Typography></Box>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute requireProfile>
              <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                <Box sx={{ p: 4 }}><Typography>History Page - Coming Soon</Typography></Box>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute requireProfile>
              <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                <Box sx={{ p: 4 }}><Typography>Support Page - Coming Soon</Typography></Box>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute requireProfile>
              <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                <Box sx={{ p: 4 }}><Typography>Profile Page - Coming Soon</Typography></Box>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </ThemeProvider>
  )
}

export default App