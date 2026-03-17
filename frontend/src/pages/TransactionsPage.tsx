import { useCallback, useEffect, useRef, useState } from 'react'
import { Receipt, Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { getTransactions } from '../api/transactions'
import type { PaginatedTransactions } from '../api/transactions'
import type { Transaction } from '../types'
import TransactionModal from '../components/transactions/TransactionModal'

type TypeFilter = 'all' | 'expense' | 'income'

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
}

function formatAmount(txn: Transaction) {
  const amount = txn.user_share_amount
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: txn.currency || 'USD',
    minimumFractionDigits: 2,
  }).format(Math.abs(amount))
  if (txn.transaction_type === 'income') return `+${formatted}`
  return formatted
}

export default function TransactionsPage() {
  const [data, setData] = useState<PaginatedTransactions | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const PER_PAGE = 50

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = {
        page,
        per_page: PER_PAGE,
        sort_by: 'date',
        sort_order: 'desc',
      }
      if (debouncedSearch) params.search = debouncedSearch
      if (typeFilter !== 'all') params.transaction_type = typeFilter
      const result = await getTransactions(params)
      setData(result)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, typeFilter])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Reset page on filter change
  useEffect(() => {
    setPage(1)
  }, [typeFilter])

  function openAdd() {
    setSelectedTxn(null)
    setModalOpen(true)
  }

  function openEdit(txn: Transaction) {
    setSelectedTxn(txn)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setSelectedTxn(null)
  }

  const total = data?.total ?? 0
  const pages = data?.pages ?? 1
  const start = total === 0 ? 0 : (page - 1) * PER_PAGE + 1
  const end = Math.min(page * PER_PAGE, total)

  const typeFilters: { label: string; value: TypeFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Expenses', value: 'expense' },
    { label: 'Income', value: 'income' },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E7EB]">
        <h1 className="text-lg font-semibold text-gray-900">Transactions</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium border border-[#E5E7EB] rounded-lg hover:border-[#0F9E64] hover:text-[#0F9E64] transition-colors"
        >
          <Plus size={14} />
          Add transaction
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-[#E5E7EB]">
        {/* Search */}
        <div className="relative" style={{ width: 280 }}>
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search transactions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-sm border border-[#E5E7EB] rounded-lg outline-none bg-white text-gray-900 placeholder-gray-400 focus:border-[#0F9E64] focus:ring-2 focus:ring-[#0F9E64]/10 transition-all"
          />
        </div>

        {/* Type filter pills */}
        <div className="flex items-center gap-1.5 ml-auto">
          {typeFilters.map(f => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`px-3 h-8 text-[13px] font-medium rounded-lg border transition-colors ${
                typeFilter === f.value
                  ? 'bg-[#F0FDF4] text-[#0F9E64] border-[#0F9E64]'
                  : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-gray-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table area */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          /* Skeleton rows */
          <div className="flex flex-col">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-3 border-b border-[#F9FAFB]">
                <div className="h-3 w-20 bg-gray-100 rounded animate-pulse shrink-0" />
                <div className="h-3 w-40 bg-gray-100 rounded animate-pulse" />
                <div className="h-5 w-24 bg-gray-100 rounded-full animate-pulse" />
                <div className="h-3 w-28 bg-gray-100 rounded animate-pulse hidden md:block" />
                <div className="h-3 w-16 bg-gray-100 rounded animate-pulse ml-auto" />
              </div>
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full min-h-[360px] gap-3">
            <Receipt size={48} className="text-[#D1D5DB]" />
            <p className="text-sm font-medium text-gray-900">No transactions yet</p>
            <p className="text-sm text-gray-400">Add your first transaction or upload a statement</p>
            <button
              onClick={openAdd}
              className="mt-1 flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-[#111] text-white rounded-lg hover:bg-[#222] transition-colors"
            >
              <Plus size={14} />
              Add transaction
            </button>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left px-4 py-2 text-[11px] font-medium text-[#9CA3AF] uppercase tracking-[0.05em] border-b border-[#F0F0F0] w-[90px]">Date</th>
                <th className="text-left px-4 py-2 text-[11px] font-medium text-[#9CA3AF] uppercase tracking-[0.05em] border-b border-[#F0F0F0]">Merchant</th>
                <th className="text-left px-4 py-2 text-[11px] font-medium text-[#9CA3AF] uppercase tracking-[0.05em] border-b border-[#F0F0F0]">Category</th>
                <th className="text-left px-4 py-2 text-[11px] font-medium text-[#9CA3AF] uppercase tracking-[0.05em] border-b border-[#F0F0F0] hidden md:table-cell">Account</th>
                <th className="text-right px-4 py-2 text-[11px] font-medium text-[#9CA3AF] uppercase tracking-[0.05em] border-b border-[#F0F0F0]">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map(txn => (
                <tr
                  key={txn.id}
                  onClick={() => openEdit(txn)}
                  className="border-b border-[#F9FAFB] hover:bg-[#FAFAFA] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-[13px] text-[#6B7280] whitespace-nowrap">
                    {formatDate(txn.date)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[14px] font-medium text-[#111]">
                      {txn.normalized_merchant ?? txn.merchant}
                    </span>
                    {txn.normalized_merchant && txn.normalized_merchant !== txn.merchant && (
                      <span className="block text-[12px] text-[#9CA3AF]">{txn.merchant}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {txn.category ? (
                      <span className="inline-block text-[12px] font-medium text-[#374151] bg-[#F3F4F6] px-2.5 py-0.5 rounded-full">
                        {txn.category}
                      </span>
                    ) : (
                      <span className="text-[12px] text-[#D1D5DB]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280] hidden md:table-cell">
                    {txn.account_name ?? <span className="text-[#D1D5DB]">—</span>}
                  </td>
                  <td className={`px-4 py-3 text-right text-[14px] font-semibold whitespace-nowrap ${
                    txn.transaction_type === 'income' ? 'text-[#0F9E64]' : 'text-[#111]'
                  }`}>
                    {formatAmount(txn)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data && data.items.length > 0 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#E5E7EB]">
          <span className="text-[13px] text-[#6B7280]">
            Showing {start}–{end} of {total}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
              const pageNum =
                pages <= 7
                  ? i + 1
                  : page <= 4
                  ? i + 1
                  : page >= pages - 3
                  ? pages - 6 + i
                  : page - 3 + i
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`min-w-[32px] h-8 px-2 text-[13px] font-medium rounded-lg transition-colors ${
                    pageNum === page
                      ? 'bg-[#111] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <TransactionModal
          transaction={selectedTxn}
          onClose={closeModal}
          onSuccess={fetchTransactions}
        />
      )}
    </div>
  )
}
