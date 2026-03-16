import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

function App() {
  const hasToken = !!localStorage.getItem('finsight_token')

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={hasToken ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={hasToken ? <Navigate to="/" replace /> : <RegisterPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
