import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/budget': 'Budget',
  '/trips': 'Trips',
  '/net-worth': 'Net worth',
  '/subscriptions': 'Subscriptions',
  '/insights': 'Insights',
  '/advisor': 'AI advisor',
  '/settings': 'Settings',
}

export default function AppShell() {
  const location = useLocation()
  const title = routeTitles[location.pathname] ?? 'FinSight'

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#FAFAFA' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        <TopBar title={title} />
        <main style={{ flex: 1, padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
