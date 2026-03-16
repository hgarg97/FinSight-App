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
