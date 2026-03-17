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

export interface BudgetItem {
  id: string
  category_id: string
  category_name: string
  allocated_amount: number
  spent: number
  remaining: number
}

export interface BudgetSummary {
  month: number
  year: number
  total_income: number
  total_budgeted: number
  total_spent: number
  unbudgeted_spending: number
  items: BudgetItem[]
}

export interface BudgetSetPayload {
  category_id: string
  category_name: string
  month: number
  year: number
  allocated_amount: number
}

export interface BudgetBulkPayload {
  month: number
  year: number
  items: { category_id: string; category_name: string; allocated_amount: number }[]
}

export interface CopyBudgetsPayload {
  from_month: number
  from_year: number
  to_month: number
  to_year: number
}

// ── Dashboard / Insights ──────────────────────────────────────────────────────

export interface DashboardMetrics {
  monthly_income: number
  total_spent: number
  savings_rate: number
  transaction_count: number
}

export interface SpendingByCategory {
  category: string
  amount: number
  color: string
}

export interface SpendingTrendPoint {
  month: string
  year: number
  amount: number
}

export interface DashboardTransaction {
  id: string
  date: string
  merchant: string
  amount_total: number
  user_share_amount: number
  category: string | null
  transaction_type: string
  currency: string
}

export interface BudgetStatusItem {
  category_name: string
  allocated: number
  spent: number
  color: string
}

export interface TopMerchant {
  merchant: string
  amount: number
  count: number
}

export interface DashboardData {
  metrics: DashboardMetrics
  spending_by_category: SpendingByCategory[]
  spending_trend: SpendingTrendPoint[]
  recent_transactions: DashboardTransaction[]
  budget_status: BudgetStatusItem[]
  top_merchants: TopMerchant[]
}
