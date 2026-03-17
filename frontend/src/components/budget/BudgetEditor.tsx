import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCategories } from '../../api/categories'
import { setBudgetsBulk } from '../../api/budgets'
import type { Category, BudgetItem } from '../../types'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface Props {
  month: number
  year: number
  existing: BudgetItem[]
  onClose: () => void
  onSaved: () => void
}

export default function BudgetEditor({ month, year, existing, onClose, onSaved }: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [income, setIncome] = useState(0)
  const [allocations, setAllocations] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getCategories().then(cats => {
      const expense = cats.filter(c => !c.is_income)
      setCategories(expense)
      const initial: Record<string, string> = {}
      for (const cat of expense) {
        const found = existing.find(e => e.category_id === cat.id)
        initial[cat.id] = found ? String(found.allocated_amount) : ''
      }
      setAllocations(initial)
    })
    const existingIncome = existing.find(e => e.category_name === '__income__')
    if (!existingIncome) setIncome(0)
  }, [])

  const totalAllocated = Object.values(allocations).reduce((sum, v) => {
    const n = parseFloat(v)
    return sum + (isNaN(n) ? 0 : n)
  }, 0)

  const diff = income - totalAllocated

  let statusText = ''
  let statusColor = '#9CA3AF'
  if (income > 0) {
    if (Math.abs(diff) < 0.01) {
      statusText = 'Fully allocated'
      statusColor = '#10B981'
    } else if (diff > 0) {
      statusText = `Underallocated by $${diff.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
      statusColor = '#D97706'
    } else {
      statusText = `Over by $${Math.abs(diff).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
      statusColor = '#EF4444'
    }
  }

  async function handleSave() {
    const items = categories
      .filter(cat => {
        const v = parseFloat(allocations[cat.id] ?? '')
        return !isNaN(v) && v > 0
      })
      .map(cat => ({
        category_id: cat.id,
        category_name: cat.name,
        allocated_amount: parseFloat(allocations[cat.id]),
      }))

    if (items.length === 0) {
      toast.error('No budgets to save')
      return
    }

    setSaving(true)
    try {
      await setBudgetsBulk({ month, year, items })
      toast.success('Budgets saved')
      onSaved()
    } catch {
      toast.error('Failed to save budgets')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: '#fff', borderRadius: 12, width: 480, maxHeight: '85vh',
          display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#111' }}>
            Set budget — {MONTH_NAMES[month - 1]} {year}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {/* Income input */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Monthly income
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#6B7280' }}>$</span>
              <input
                type="number"
                value={income || ''}
                onChange={e => setIncome(parseFloat(e.target.value) || 0)}
                placeholder="0"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '8px 12px 8px 24px', fontSize: 14, border: '1px solid #E5E7EB',
                  borderRadius: 8, outline: 'none', color: '#111',
                }}
              />
            </div>
          </div>

          {/* Category allocations */}
          <div style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
            Budget by category
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {categories.map(cat => (
              <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                  {cat.color && (
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color, display: 'inline-block', flexShrink: 0 }} />
                  )}
                  <span style={{ fontSize: 14, color: '#374151' }}>{cat.name}</span>
                </div>
                <div style={{ position: 'relative', width: 120 }}>
                  <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#9CA3AF' }}>$</span>
                  <input
                    type="number"
                    value={allocations[cat.id] ?? ''}
                    onChange={e => setAllocations(prev => ({ ...prev, [cat.id]: e.target.value }))}
                    placeholder="0"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '7px 10px 7px 20px', fontSize: 13,
                      border: '1px solid #E5E7EB', borderRadius: 8,
                      outline: 'none', color: '#111', textAlign: 'right',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #F3F4F6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: '#6B7280' }}>
              Total allocated: <strong style={{ color: '#111' }}>
                ${totalAllocated.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </strong>
            </div>
            {statusText && (
              <div style={{ fontSize: 13, fontWeight: 500, color: statusColor }}>{statusText}</div>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%', padding: '10px', fontSize: 14, fontWeight: 500,
              background: '#111', color: '#fff', border: 'none', borderRadius: 8,
              cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving…' : 'Save budgets'}
          </button>
        </div>
      </div>
    </div>
  )
}
