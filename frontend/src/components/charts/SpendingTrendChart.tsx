import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { SpendingTrendPoint } from '../../types'

interface Props {
  data: SpendingTrendPoint[]
  currentMonth: string
  currentYear: number
}

function fmt(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function SpendingTrendChart({ data, currentMonth, currentYear }: Props) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={24}>
        <CartesianGrid vertical={false} stroke="#F3F4F6" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: '#9CA3AF' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => '$' + (v >= 1000 ? Math.round(v / 1000) + 'k' : v)}
          width={40}
        />
        <Tooltip
          formatter={(value: number) => [fmt(value), 'Spent']}
          contentStyle={{
            background: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: 8,
            fontSize: 12,
            boxShadow: 'none',
          }}
          cursor={{ fill: '#F9FAFB' }}
        />
        <Bar
          dataKey="amount"
          radius={[4, 4, 0, 0]}
          fill="#111"
          // Highlight current month bar in emerald
          label={false}
          shape={(props: any) => {
            const { x, y, width, height, month, year } = props
            const isCurrent = month === currentMonth && year === currentYear
            return (
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={isCurrent ? '#0F9E64' : '#111'}
                rx={4}
                ry={4}
              />
            )
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
