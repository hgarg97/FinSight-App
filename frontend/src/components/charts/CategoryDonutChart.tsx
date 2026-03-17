import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { SpendingByCategory } from '../../types'

interface Props {
  data: SpendingByCategory[]
}

function fmt(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function CategoryDonutChart({ data }: Props) {
  const total = data.reduce((sum, d) => sum + d.amount, 0)

  if (data.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 14, padding: '40px 0' }}>
        No spending data
      </div>
    )
  }

  return (
    <div>
      <div style={{ position: 'relative' }}>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              dataKey="amount"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [fmt(value), '']}
              contentStyle={{
                background: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                fontSize: 12,
                boxShadow: 'none',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111', fontVariantNumeric: 'tabular-nums' }}>
            {fmt(total)}
          </div>
          <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1 }}>total</div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
        {data.map((entry) => {
          const pct = total > 0 ? Math.round((entry.amount / total) * 100) : 0
          return (
            <div key={entry.category} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: entry.color,
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              <span style={{ color: '#374151', flex: 1 }}>{entry.category}</span>
              <span style={{ color: '#9CA3AF', fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
