import client from './client'
import type {
  BudgetSummary,
  BudgetSetPayload,
  BudgetBulkPayload,
  CopyBudgetsPayload,
} from '../types'

export async function getBudgetSummary(month: number, year: number): Promise<BudgetSummary> {
  const { data } = await client.get('/api/budgets', { params: { month, year } })
  return data
}

export async function setBudget(payload: BudgetSetPayload): Promise<void> {
  await client.post('/api/budgets', payload)
}

export async function setBudgetsBulk(payload: BudgetBulkPayload): Promise<void> {
  await client.post('/api/budgets/bulk', payload)
}

export async function deleteBudget(id: string): Promise<void> {
  await client.delete(`/api/budgets/${id}`)
}

export async function copyBudgets(payload: CopyBudgetsPayload): Promise<void> {
  await client.post('/api/budgets/copy', payload)
}
