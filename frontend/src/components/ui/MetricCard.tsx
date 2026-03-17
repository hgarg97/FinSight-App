import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

interface Props {
  label: string
  value: string
  subtitle?: string
  trend?: 'up' | 'down' | null
}

export default function MetricCard({ label, value, subtitle, trend }: Props) {
  const subtitleColor =
    trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#9CA3AF'

  return (
    <div
      style={{
        background: '#FAFAFA',
        border: '1px solid #F3F4F6',
        borderRadius: 10,
        padding: '16px 20px',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: '#9CA3AF',
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: '#111',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          lineHeight: 1,
          marginBottom: subtitle ? 6 : 0,
        }}
      >
        {value}
      </div>
      {subtitle && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            fontSize: 12,
            color: subtitleColor,
          }}
        >
          {trend === 'up' && <ArrowUpRight size={13} />}
          {trend === 'down' && <ArrowDownRight size={13} />}
          {subtitle}
        </div>
      )}
    </div>
  )
}
