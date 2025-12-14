import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  email: string
  name?: string
}

interface AuthStore {
  user: User | null
  isAuthDialogOpen: boolean
  setUser: (user: User | null) => void
  logout: () => void
  openAuthDialog: () => void
  closeAuthDialog: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthDialogOpen: false,
      setUser: (user) => set({ user, isAuthDialogOpen: false }),
      logout: () => set({ user: null }),
      openAuthDialog: () => set({ isAuthDialogOpen: true }),
      closeAuthDialog: () => set({ isAuthDialogOpen: false }),
    }),
    {
      name: "auth-storage",
    },
  ),
)
