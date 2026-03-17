import client from './client'
import type { DashboardData } from '../types'

export async function getDashboard(month: number, year: number): Promise<DashboardData> {
  const { data } = await client.get('/api/insights/dashboard', { params: { month, year } })
  return data
}
