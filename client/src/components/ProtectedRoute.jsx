import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const ProtectedRoute = ({ children, requireProfile = false }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // If profile completion is required and user hasn't reached threshold
  // Backend controls the score - we just check if it's enough
  if (requireProfile && user?.profile_completion < 30) {
    return <Navigate to="/complete-profile" replace />
  }

  return children
}

export default ProtectedRoute