export interface User {
  id: number
  email: string
  username: string
  full_name: string
  currency: string
  monthly_income: number | null
  created_at: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface ApiError {
  detail: string
  status_code: number
}

export interface Transaction {
  id: string
  user_id: string
  date: string
  merchant: string
  normalized_merchant: string | null
  amount_total: number
  user_share_amount: number
  currency: string
  account_id: string | null
  account_name: string | null
  account_type: string | null
  transaction_type: string
  category: string | null
  subcategory: string | null
  payment_method: string | null
  is_split: boolean
  split_details_json: string | null
  is_reimbursable: boolean
  reimbursement_status: string
  trip_id: string | null
  subscription_flag: boolean
  notes: string | null
  source_file: string | null
  created_at: string
  updated_at: string
}

export interface TransactionCreate {
  date: string
  merchant: string
  amount_total: number
  user_share_amount?: number
  currency?: string
  account_id?: string | null
  account_name?: string | null
  transaction_type?: string
  category?: string | null
  subcategory?: string | null
  payment_method?: string | null
  is_split?: boolean
  is_reimbursable?: boolean
  notes?: string | null
}

export interface TransactionFilters {
  start_date?: string
  end_date?: string
  category?: string
  account_id?: string
  transaction_type?: string
  search?: string
}

export interface TransactionSummary {
  total_income: number
  total_expenses: number
  net: number
  by_category: { category: string | null; amount: number }[]
  transaction_count: number
}

export interface Account {
  id: string
  user_id: string
  name: string
  account_type: string
  institution: string | null
  current_balance: number
  is_asset: boolean
  is_active: boolean
  created_at: string
}

export interface AccountCreate {
  name: string
  account_type: string
  institution?: string | null
  current_balance?: number
  is_asset?: boolean
}

export interface Category {
  id: string
  user_id: string | null
  name: string
  icon: string | null
  color: string | null
  is_income: boolean
  sort_order: number
}
