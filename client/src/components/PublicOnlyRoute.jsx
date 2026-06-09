import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  if (isAuthenticated) {
    // If profile incomplete, force complete profile first
    if (user?.profile_completion < 100) {
      return <Navigate to="/complete-profile" replace />
    }
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default PublicOnlyRoute