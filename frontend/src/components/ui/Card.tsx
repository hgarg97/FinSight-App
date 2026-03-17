import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  title?: string
  action?: ReactNode
}

export default function Card({ children, title, action }: Props) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E5E7EB',
        borderRadius: 12,
        padding: 20,
      }}
    >
      {(title || action) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          {title && (
            <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{title}</span>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
