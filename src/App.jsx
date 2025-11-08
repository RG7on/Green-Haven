import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Home from './pages/Home'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Profile from './pages/Profile'
import { useSelector } from 'react-redux'

function ProtectedRoute({ children }) {
  const user = useSelector(s => s.auth.user)
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/product/:id" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
