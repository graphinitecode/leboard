import { create } from 'zustand'

import type { UserViewModel } from '../user.presenter'

interface AuthState {
  user: UserViewModel | null
  isAuthenticated: boolean
  login: (user: UserViewModel) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}))