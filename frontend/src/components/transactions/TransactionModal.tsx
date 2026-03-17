import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Transaction, TransactionCreate, Account, Category } from '../../types'
import { createTransaction, updateTransaction, deleteTransaction } from '../../api/transactions'
import { getAccounts } from '../../api/accounts'
import { getCategories } from '../../api/categories'

interface Props {
  transaction?: Transaction | null
  onClose: () => void
  onSuccess: () => void
}

const inputClass =
  'w-full h-10 px-3 text-sm border border-gray-200 rounded-lg outline-none transition-all duration-150 bg-white text-gray-900 placeholder-gray-400 focus:border-[#0F9E64] focus:ring-2 focus:ring-[#0F9E64]/10'

const selectClass =
  'w-full h-10 px-3 text-sm border border-gray-200 rounded-lg outline-none transition-all duration-150 bg-white text-gray-900 focus:border-[#0F9E64] focus:ring-2 focus:ring-[#0F9E64]/10'

export default function TransactionModal({ transaction, onClose, onSuccess }: Props) {
  const isEdit = Boolean(transaction)
  const overlayRef = useRef<HTMLDivElement>(null)

  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState<TransactionCreate>({
    date: transaction?.date ?? new Date().toISOString().split('T')[0],
    merchant: transaction?.merchant ?? '',
    amount_total: transaction?.amount_total ?? 0,
    transaction_type: transaction?.transaction_type ?? 'expense',
    category: transaction?.category ?? null,
    account_id: transaction?.account_id ?? null,
    account_name: transaction?.account_name ?? null,
    notes: transaction?.notes ?? null,
  })

  useEffect(() => {
    Promise.all([getAccounts(), getCategories()]).then(([accs, cats]) => {
      setAccounts(accs)
      setCategories(cats)
    })
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose()
  }

  function set<K extends keyof TransactionCreate>(key: K, value: TransactionCreate[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit && transaction) {
        await updateTransaction(transaction.id, form)
        toast.success('Transaction updated')
      } else {
        await createTransaction(form)
        toast.success('Transaction added')
      }
      onSuccess()
      onClose()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!transaction) return
    setDeleting(true)
    try {
      await deleteTransaction(transaction.id)
      toast.success('Transaction deleted')
      onSuccess()
      onClose()
    } catch {
      toast.error('Failed to delete transaction')
    } finally {
      setDeleting(false)
    }
  }

  const expenseCategories = categories.filter(c => !c.is_income)
  const incomeCategories = categories.filter(c => c.is_income)
  const visibleCategories = form.transaction_type === 'income' ? incomeCategories : expenseCategories

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full mx-4"
        style={{ maxWidth: 480, padding: 24 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? 'Edit transaction' : 'Add transaction'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Date</label>
            <input
              type="date"
              required
              className={inputClass}
              value={form.date}
              onChange={e => set('date', e.target.value)}
            />
          </div>

          {/* Merchant */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Merchant</label>
            <input
              type="text"
              required
              placeholder="e.g. Whole Foods"
              className={inputClass}
              value={form.merchant}
              onChange={e => set('merchant', e.target.value)}
            />
          </div>

          {/* Amount + type toggle */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Amount</label>
            <div className="flex gap-2">
              <input
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                className={inputClass}
                value={form.amount_total === 0 ? '' : form.amount_total}
                onChange={e => set('amount_total', parseFloat(e.target.value) || 0)}
              />
              <div className="flex rounded-lg border border-gray-200 overflow-hidden shrink-0 text-sm">
                <button
                  type="button"
                  onClick={() => set('transaction_type', 'expense')}
                  className={`px-3 h-10 font-medium transition-colors ${
                    form.transaction_type === 'expense'
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => set('transaction_type', 'income')}
                  className={`px-3 h-10 font-medium transition-colors ${
                    form.transaction_type === 'income'
                      ? 'bg-[#0F9E64] text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Income
                </button>
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Category</label>
            <select
              className={selectClass}
              value={form.category ?? ''}
              onChange={e => set('category', e.target.value || null)}
            >
              <option value="">Select category</option>
              {visibleCategories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Account */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Account</label>
            <select
              className={selectClass}
              value={form.account_id ?? ''}
              onChange={e => {
                const acc = accounts.find(a => a.id === e.target.value)
                set('account_id', e.target.value || null)
                set('account_name', acc?.name ?? null)
              }}
            >
              <option value="">Select account</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              rows={2}
              placeholder="Any notes…"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none transition-all duration-150 bg-white text-gray-900 placeholder-gray-400 focus:border-[#0F9E64] focus:ring-2 focus:ring-[#0F9E64]/10 resize-none"
              value={form.notes ?? ''}
              onChange={e => set('notes', e.target.value || null)}
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {isEdit && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 h-9 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 h-9 bg-[#111] text-white rounded-lg text-sm font-semibold hover:bg-[#222] transition-colors disabled:opacity-60"
              >
                {loading ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
