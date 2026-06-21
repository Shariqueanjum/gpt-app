import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const ProtectedRoute = ({ children, requireProfile = false, adminOnly = false }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // If profile completion is required and user hasn't reached threshold
  if (requireProfile && user?.profile_completion < 30) {
    return <Navigate to="/complete-profile" replace />
  }

  // Admin-only routes
  if (adminOnly && user?.role !== 'admin' && !user?.is_admin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute