import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard } from '../api/insights'
import CategoryDonutChart from '../components/charts/CategoryDonutChart'
import SpendingTrendChart from '../components/charts/SpendingTrendChart'
import Card from '../components/ui/Card'
import MetricCard from '../components/ui/MetricCard'
import type { BudgetStatusItem, DashboardData, DashboardTransaction } from '../types'

// ── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function fmtMoney(n: number) {
  return '$' + Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function fmtPct(n: number) {
  return n.toFixed(1) + '%'
}

function fmtDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── Skeleton block ────────────────────────────────────────────────────────────

function Skeleton({ width = '100%', height = 16 }: { width?: string | number; height?: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 6,
        background: '#F3F4F6',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    />
  )
}

// ── Budget progress row ───────────────────────────────────────────────────────

function BudgetRow({ item }: { item: BudgetStatusItem }) {
  const pct = item.allocated > 0 ? Math.min((item.spent / item.allocated) * 100, 100) : 0
  const isOver = item.spent > item.allocated

  return (
    <div style={{ paddingBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: item.color,
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 13, color: '#374151' }}>{item.category_name}</span>
        </div>
        <span style={{ fontSize: 12, color: '#9CA3AF' }}>
          {fmtMoney(item.spent)} / {fmtMoney(item.allocated)}
        </span>
      </div>
      <div style={{ height: 4, background: '#F3F4F6', borderRadius: 2, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: isOver ? '#EF4444' : item.color,
            borderRadius: 2,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  )
}

// ── Transaction row ───────────────────────────────────────────────────────────

function TxnRow({ txn }: { txn: DashboardTransaction }) {
  const isIncome = txn.transaction_type === 'income'
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 0',
        borderBottom: '1px solid #F9FAFB',
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>{txn.merchant}</div>
        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>
          {fmtDate(txn.date)}{txn.category ? ` · ${txn.category}` : ''}
        </div>
      </div>
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: isIncome ? '#10B981' : '#111',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {isIncome ? '+' : '-'}{fmtMoney(txn.user_share_amount)}
      </span>
    </div>
  )
}

// ── Fade / pulse animation styles ─────────────────────────────────────────────

const animStyles = `
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
}
`

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    getDashboard(month, year)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [month, year])

  const hasData =
    data && (data.metrics.transaction_count > 0 || data.spending_by_category.length > 0)

  const currentMonthShort = MONTH_SHORT[month - 1]
  const savingsRate = data?.metrics.savings_rate ?? 0
  const savingsTrend: 'up' | 'down' | null =
    savingsRate > 30 ? 'up' : savingsRate < 10 ? 'down' : null

  const viewAllStyle: React.CSSProperties = {
    fontSize: 12,
    color: '#6B7280',
    textDecoration: 'none',
  }

  return (
    <>
      <style>{animStyles}</style>
      <div style={{ padding: '32px 40px', maxWidth: 1140, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#111' }}>
            {MONTH_NAMES[month - 1]} {year}
          </div>
          <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>Overview</div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Could not load dashboard
            </div>
            <div style={{ fontSize: 13, color: '#9CA3AF' }}>
              Check that the backend server is running.
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && !hasData && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
              No data for {MONTH_NAMES[month - 1]}
            </div>
            <div
              style={{
                fontSize: 13,
                color: '#9CA3AF',
                maxWidth: 320,
                margin: '0 auto',
                lineHeight: 1.7,
              }}
            >
              Upload a bank statement or add transactions manually to see your spending overview.
            </div>
            <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Link
                to="/transactions"
                style={{
                  fontSize: 13,
                  padding: '8px 16px',
                  border: '1px solid #D1D5DB',
                  borderRadius: 8,
                  color: '#374151',
                  textDecoration: 'none',
                }}
              >
                Add transaction
              </Link>
            </div>
          </div>
        )}

        {/* Dashboard content */}
        {(loading || hasData) && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              animation: loading ? 'none' : 'fadeUp 0.3s ease',
            }}
          >
            {/* ROW 1 — 4 metric cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      background: '#FAFAFA',
                      border: '1px solid #F3F4F6',
                      borderRadius: 10,
                      padding: '16px 20px',
                    }}
                  >
                    <Skeleton width="55%" height={10} />
                    <div style={{ marginTop: 10 }}>
                      <Skeleton width="75%" height={28} />
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <Skeleton width="45%" height={10} />
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <MetricCard
                    label="Monthly income"
                    value={fmtMoney(data!.metrics.monthly_income)}
                    subtitle="this month"
                    trend={null}
                  />
                  <MetricCard
                    label="Total spent"
                    value={fmtMoney(data!.metrics.total_spent)}
                    subtitle={
                      data!.metrics.monthly_income > 0
                        ? fmtPct((data!.metrics.total_spent / data!.metrics.monthly_income) * 100) +
                          ' of income'
                        : undefined
                    }
                    trend={null}
                  />
                  <MetricCard
                    label="Savings rate"
                    value={fmtPct(savingsRate)}
                    subtitle={savingsRate >= 0 ? 'of income saved' : 'spending exceeds income'}
                    trend={savingsTrend}
                  />
                  <MetricCard
                    label="Transactions"
                    value={String(data!.metrics.transaction_count)}
                    subtitle="this month"
                    trend={null}
                  />
                </>
              )}
            </div>

            {/* ROW 2 — Spending trend (60%) + Top categories (40%) */}
            <div style={{ display: 'grid', gridTemplateColumns: '60% 1fr', gap: 16 }}>
              <Card title="Spending trend">
                {loading ? (
                  <Skeleton height={200} />
                ) : (
                  <SpendingTrendChart
                    data={data!.spending_trend}
                    currentMonth={currentMonthShort}
                    currentYear={year}
                  />
                )}
              </Card>

              <Card title="Top categories">
                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <Skeleton height={180} />
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} height={12} />
                    ))}
                  </div>
                ) : (
                  <CategoryDonutChart data={data!.spending_by_category.slice(0, 6)} />
                )}
              </Card>
            </div>

            {/* ROW 3 — Budget status (50%) + Recent transactions (50%) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Card
                title="Budget status"
                action={
                  <Link to="/budget" style={viewAllStyle}>
                    View all →
                  </Link>
                }
              >
                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i}>
                        <Skeleton height={12} />
                        <div style={{ marginTop: 6 }}>
                          <Skeleton height={4} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : data!.budget_status.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#9CA3AF', padding: '16px 0' }}>
                    No budgets set for this month.{' '}
                    <Link to="/budget" style={{ color: '#6366F1' }}>
                      Set budgets →
                    </Link>
                  </div>
                ) : (
                  <div>
                    {data!.budget_status.map((item) => (
                      <BudgetRow key={item.category_name} item={item} />
                    ))}
                  </div>
                )}
              </Card>

              <Card
                title="Recent transactions"
                action={
                  <Link to="/transactions" style={viewAllStyle}>
                    View all →
                  </Link>
                }
              >
                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <div style={{ flex: 1 }}>
                          <Skeleton width="60%" height={12} />
                          <div style={{ marginTop: 5 }}>
                            <Skeleton width="40%" height={10} />
                          </div>
                        </div>
                        <Skeleton width={60} height={12} />
                      </div>
                    ))}
                  </div>
                ) : data!.recent_transactions.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#9CA3AF', padding: '16px 0' }}>
                    No transactions yet.
                  </div>
                ) : (
                  <div>
                    {data!.recent_transactions.map((txn) => (
                      <TxnRow key={txn.id} txn={txn} />
                    ))}
                  </div>
                )}
              </Card>
            </div>

          </div>
        )}

      </div>
    </>
  )
}
