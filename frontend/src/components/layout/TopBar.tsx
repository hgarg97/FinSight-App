import { Bell } from 'lucide-react'

interface TopBarProps {
  title: string
}

export default function TopBar({ title }: TopBarProps) {
  return (
    <header
      style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        backgroundColor: 'white',
        borderBottom: '1px solid #F0F0F0',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 20, fontWeight: 700, color: '#111' }}>{title}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Bell size={20} color="#9CA3AF" strokeWidth={1.8} />
      </div>
    </header>
  )
}
