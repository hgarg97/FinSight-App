import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ProtectedRoute from './routes/ProtectedRoute'
import AppShell from './components/layout/AppShell'
import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
import BudgetPage from './pages/BudgetPage'
import TripsPage from './pages/TripsPage'
import NetWorthPage from './pages/NetWorthPage'
import SubscriptionsPage from './pages/SubscriptionsPage'
import InsightsPage from './pages/InsightsPage'
import AdvisorPage from './pages/AdvisorPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { fontSize: 13, borderRadius: 8, background: '#111', color: '#fff' },
          success: { style: { background: '#0F9E64' } },
          error: { style: { background: '#EF4444' } },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="trips" element={<TripsPage />} />
          <Route path="net-worth" element={<NetWorthPage />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="advisor" element={<AdvisorPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
