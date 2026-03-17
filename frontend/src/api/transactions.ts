import client from './client'
import type { Transaction, TransactionCreate, TransactionFilters, TransactionSummary } from '../types'

export interface PaginatedTransactions {
  items: Transaction[]
  total: number
  page: number
  per_page: number
  pages: number
}

export async function getTransactions(
  params: TransactionFilters & { page?: number; per_page?: number; sort_by?: string; sort_order?: string }
): Promise<PaginatedTransactions> {
  const { data } = await client.get('/api/transactions', { params })
  return data
}

export async function getTransaction(id: string): Promise<Transaction> {
  const { data } = await client.get(`/api/transactions/${id}`)
  return data
}

export async function createTransaction(payload: TransactionCreate): Promise<Transaction> {
  const { data } = await client.post('/api/transactions', payload)
  return data
}

export async function updateTransaction(id: string, payload: Partial<TransactionCreate>): Promise<Transaction> {
  const { data } = await client.put(`/api/transactions/${id}`, payload)
  return data
}

export async function deleteTransaction(id: string): Promise<void> {
  await client.delete(`/api/transactions/${id}`)
}

export async function getTransactionSummary(month: number, year: number): Promise<TransactionSummary> {
  const { data } = await client.get('/api/transactions/summary', { params: { month, year } })
  return data
}
