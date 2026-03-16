import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Briefcase,
  TrendingUp,
  RefreshCw,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
} from 'lucide-react'
import { PieChart as PieChartIcon } from 'lucide-react'
import logoFull from '../../assets/logo-full.png'
import { useAuthStore } from '../../store/authStore'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', Icon: ArrowLeftRight },
  { to: '/budget', label: 'Budget', Icon: PieChartIcon },
  { to: '/trips', label: 'Trips', Icon: Briefcase },
  { to: '/net-worth', label: 'Net worth', Icon: TrendingUp },
  { to: '/subscriptions', label: 'Subscriptions', Icon: RefreshCw },
  { to: '/insights', label: 'Insights', Icon: BarChart3 },
  { to: '/advisor', label: 'AI advisor', Icon: MessageSquare },
]

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside
      style={{
        width: 240,
        flexShrink: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        borderRight: '1px solid #F0F0F0',
        padding: '16px 12px',
        boxSizing: 'border-box',
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 32, paddingLeft: 4 }}>
        <img
          src={logoFull}
          alt="FinSight"
          style={{ height: 28, width: 'auto', objectFit: 'contain' }}
        />
      </div>

      {/* Nav items — scrollable */}
      <nav style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: isActive ? 600 : 500,
              fontSize: 14,
              color: isActive ? '#0F9E64' : '#6B7280',
              backgroundColor: isActive ? '#F0FDF4' : 'transparent',
              transition: 'background 0.15s',
            })}
            onMouseEnter={(e) => {
              const el = e.currentTarget
              if (!el.getAttribute('aria-current')) {
                el.style.backgroundColor = '#F9FAFB'
              }
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget
              if (!el.getAttribute('aria-current')) {
                el.style.backgroundColor = 'transparent'
              }
            }}
          >
            {({ isActive }) => (
              <>
                <Icon size={20} color={isActive ? '#0F9E64' : '#9CA3AF'} strokeWidth={1.8} />
                {label}
              </>
            )}
          </NavLink>
        ))}

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: '#F0F0F0', margin: '12px 0' }} />

        <NavLink
          to="/settings"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 12px',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: isActive ? 600 : 500,
            fontSize: 14,
            color: isActive ? '#0F9E64' : '#6B7280',
            backgroundColor: isActive ? '#F0FDF4' : 'transparent',
            transition: 'background 0.15s',
          })}
          onMouseEnter={(e) => {
            const el = e.currentTarget
            if (!el.getAttribute('aria-current')) {
              el.style.backgroundColor = '#F9FAFB'
            }
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget
            if (!el.getAttribute('aria-current')) {
              el.style.backgroundColor = 'transparent'
            }
          }}
        >
          {({ isActive }) => (
            <>
              <Settings size={20} color={isActive ? '#0F9E64' : '#9CA3AF'} strokeWidth={1.8} />
              Settings
            </>
          )}
        </NavLink>
      </nav>

      {/* Bottom: user info + logout */}
      <div style={{ marginTop: 16 }}>
        {/* User info */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 4 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: '#F3F4F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6B7280',
                fontWeight: 600,
                fontSize: 12,
                flexShrink: 0,
              }}
            >
              {getInitials(user.full_name)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 14,
                  color: '#111',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user.full_name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#9CA3AF',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user.email}
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 12px',
            borderRadius: 8,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
            color: '#9CA3AF',
            width: '100%',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.color = '#EF4444'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.color = '#9CA3AF'
          }}
        >
          <LogOut size={20} strokeWidth={1.8} />
          Log out
        </button>
      </div>
    </aside>
  )
}
