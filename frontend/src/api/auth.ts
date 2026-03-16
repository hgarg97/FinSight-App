import client from './client'
import type { AuthResponse, User } from '../types'

export const authApi = {
  register: (data: {
    email: string
    username: string
    full_name: string
    password: string
  }) => client.post<AuthResponse>('/api/auth/register', data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    client.post<AuthResponse>('/api/auth/login', data).then((r) => r.data),

  getMe: () => client.get<User>('/api/auth/me').then((r) => r.data),

  updateProfile: (data: Partial<User>) =>
    client.put<User>('/api/auth/me', data).then((r) => r.data),
}
