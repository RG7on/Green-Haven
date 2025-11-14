import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

function AdminProtectedRoute({ children }) {
  const { user } = useSelector((state) => state.auth)

  if (!user) {
    // Not logged in, redirect to login
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'admin') {
    // Not an admin, redirect to home
    return <Navigate to="/home" replace />
  }

  return children
}

export default AdminProtectedRoute
