import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { getBudgetSummary } from '../api/budgets'
import type { BudgetSummary, BudgetItem } from '../types'
import BudgetEditor from '../components/budget/BudgetEditor'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const PALETTE = [
  '#6366F1', '#F59E0B', '#10B981', '#EC4899',
  '#3B82F6', '#EF4444', '#8B5CF6', '#06B6D4',
  '#84CC16', '#F97316',
]

function getCategoryColor(index: number): string {
  return PALETTE[index % PALETTE.length]
}

function fmt(n: number) {
  return '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function BudgetProgressItem({ item, color }: { item: BudgetItem; color: string }) {
  const pct = item.allocated_amount > 0 ? Math.min((item.spent / item.allocated_amount) * 100, 100) : 0
  const isOver = item.spent > item.allocated_amount
  const isWarning = pct >= 80 && !isOver

  return (
    <div style={{ paddingBottom: 16, borderBottom: '1px solid #F3F4F6' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: '#111' }}>{item.category_name}</span>
        </div>
        <span style={{ fontSize: 13, color: '#6B7280' }}>
          {fmt(item.spent)} / {fmt(item.allocated_amount)}
        </span>
      </div>
      <div style={{ height: 6, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: isOver ? '#EF4444' : color,
            borderRadius: 3,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <div style={{ marginTop: 4, fontSize: 12, color: isOver ? '#EF4444' : isWarning ? '#EF9F27' : '#9CA3AF' }}>
        {isOver
          ? `Over budget by ${fmt(item.spent - item.allocated_amount)}`
          : isWarning
          ? `>80% spent`
          : 'on track'}
      </div>
    </div>
  )
}

export default function BudgetPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [summary, setSummary] = useState<BudgetSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [editorOpen, setEditorOpen] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await getBudgetSummary(month, year)
      setSummary(data)
    } catch {
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [month, year])

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const remaining = summary ? summary.total_income - summary.total_spent : 0
  const pieData = (summary?.items ?? []).map((item, i) => ({
    name: item.category_name,
    value: item.allocated_amount,
    color: getCategoryColor(i),
  }))

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={prevMonth}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center', color: '#6B7280' }}
          >
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#111', minWidth: 140, textAlign: 'center' }}>
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button
            onClick={nextMonth}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center', color: '#6B7280' }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <button
          onClick={() => setEditorOpen(true)}
          style={{
            padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            border: '1px solid #D1D5DB', borderRadius: 8, background: '#fff', color: '#374151',
          }}
        >
          Edit budget
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'INCOME', value: fmt(summary?.total_income ?? 0), sub: 'this month', subColor: '#9CA3AF' },
          { label: 'BUDGETED', value: fmt(summary?.total_budgeted ?? 0), sub: 'allocated', subColor: '#9CA3AF' },
          { label: 'SPENT', value: fmt(summary?.total_spent ?? 0), sub: 'of budget', subColor: '#9CA3AF' },
          {
            label: 'REMAINING',
            value: (remaining < 0 ? '-' : '') + fmt(remaining),
            sub: remaining >= 0 ? 'available' : 'over budget',
            subColor: remaining >= 0 ? '#10B981' : '#EF4444',
          },
        ].map(card => (
          <div
            key={card.label}
            style={{ background: '#FAFAFA', borderRadius: 10, padding: '16px 20px', border: '1px solid #F3F4F6' }}
          >
            <div style={{ fontSize: 12, fontWeight: 500, color: '#9CA3AF', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>
              {card.label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#111', marginBottom: 2 }}>
              {loading ? '—' : card.value}
            </div>
            <div style={{ fontSize: 12, color: card.subColor }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ display: 'grid', gridTemplateColumns: '60% 40%', gap: 32 }}>
        {/* Left: category breakdown */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 16 }}>Category Breakdown</div>
          {loading ? (
            <div style={{ color: '#9CA3AF', fontSize: 14 }}>Loading…</div>
          ) : !summary || summary.items.length === 0 ? (
            <div style={{ color: '#9CA3AF', fontSize: 14 }}>
              No budgets set for this month.{' '}
              <button
                onClick={() => setEditorOpen(true)}
                style={{ color: '#6366F1', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: 0 }}
              >
                Set budgets →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {summary.items.map((item, i) => (
                <BudgetProgressItem key={item.id} item={item} color={getCategoryColor(i)} />
              ))}
              {summary.unbudgeted_spending > 0 && (
                <div style={{ fontSize: 13, color: '#9CA3AF', paddingTop: 4 }}>
                  + {fmt(summary.unbudgeted_spending)} in unbudgeted categories
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: donut chart */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 16 }}>Allocation</div>
          {pieData.length === 0 ? (
            <div style={{ color: '#9CA3AF', fontSize: 14 }}>No data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [fmt(value), 'Allocated']}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                {pieData.map((entry) => {
                  const pct = summary && summary.total_budgeted > 0
                    ? Math.round((entry.value / summary.total_budgeted) * 100)
                    : 0
                  return (
                    <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: entry.color, display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ color: '#374151', flex: 1 }}>{entry.name}</span>
                      <span style={{ color: '#9CA3AF' }}>{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {editorOpen && (
        <BudgetEditor
          month={month}
          year={year}
          existing={summary?.items ?? []}
          onClose={() => setEditorOpen(false)}
          onSaved={() => { setEditorOpen(false); load() }}
        />
      )}
    </div>
  )
}
