import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

// Guards all /admin/* routes (except /admin/login).
// Completely independent of the regular user auth state.
const AdminProtectedRoute = ({ children }) => {
  const { isAdminAuthenticated } = useSelector((state) => state.adminAuth)

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

export default AdminProtectedRoute