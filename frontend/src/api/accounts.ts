import client from './client'
import type { Account, AccountCreate } from '../types'

export async function getAccounts(): Promise<Account[]> {
  const { data } = await client.get('/api/accounts')
  return data
}

export async function createAccount(payload: AccountCreate): Promise<Account> {
  const { data } = await client.post('/api/accounts', payload)
  return data
}
