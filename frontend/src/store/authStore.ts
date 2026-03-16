import { create } from 'zustand'
import { authApi } from '../api/auth'
import type { User } from '../types'

const TOKEN_KEY = 'finsight_token'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    email: string
    username: string
    full_name: string
    password: string
  }) => Promise<void>
  logout: () => void
  fetchUser: () => Promise<void>
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY),
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true })
    const data = await authApi.login({ email, password })
    localStorage.setItem(TOKEN_KEY, data.access_token)
    set({ token: data.access_token, user: data.user, isAuthenticated: true, isLoading: false })
  },

  register: async (registerData) => {
    set({ isLoading: true })
    const data = await authApi.register(registerData)
    localStorage.setItem(TOKEN_KEY, data.access_token)
    set({ token: data.access_token, user: data.user, isAuthenticated: true, isLoading: false })
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    set({ user: null, token: null, isAuthenticated: false })
  },

  fetchUser: async () => {
    set({ isLoading: true })
    const user = await authApi.getMe()
    set({ user, isAuthenticated: true, isLoading: false })
  },

  setUser: (user) => set({ user }),
}))
