import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { AuthSession } from '../types/auth.model'

interface AuthSessionState {
  session: AuthSession | null
  setSession: (session: AuthSession) => void
  clearSession: () => void
}

export const useAuthSessionStore = create<AuthSessionState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      clearSession: () => set({ session: null }),
    }),
    {
      name: 'despensa-auth-session',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
