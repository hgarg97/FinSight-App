import client from './client'
import type { Category } from '../types'

export async function getCategories(): Promise<Category[]> {
  const { data } = await client.get('/api/categories')
  return data
}
