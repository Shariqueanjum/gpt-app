import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyEmailPage from './pages/VerifyEmailPage'

function App() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1))
      if (element) {
        setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    }
  }, [location])

  const showLogin = location.pathname === '/login'
  const showRegister = location.pathname === '/register'
  
  // Check if we're on a full-page route (not overlay)
  const isFullPage = location.pathname === '/verify-email'

  return (
    <>
      {/* Only render homepage as background for overlay routes */}
      {!isFullPage && <HomePage />}

      {/* Overlay modals */}
      {showLogin && <LoginPage />}
      {showRegister && <RegisterPage />}

      {/* Full page routes */}
      <Routes>
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/login" element={null} />
        <Route path="/register" element={null} />
      </Routes>
    </>
  )
}

export default App