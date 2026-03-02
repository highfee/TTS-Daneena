import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  email: string
  name?: string
  accessToken?: string
}

interface AuthStore {
  user: User | null
  isAuthDialogOpen: boolean
  setUser: (user: User | null) => void
  logout: () => void
  openAuthDialog: () => void
  closeAuthDialog: () => void
  refreshAccessToken: () => Promise<string | null>
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

      refreshAccessToken: async () => {
        try {
          const res = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include", // sends the httpOnly refresh_token cookie
          })
          if (!res.ok) {
            // Refresh failed — log the user out
            set({ user: null })
            return null
          }
          const data = await res.json()
          const newToken: string = data.access_token
          set((state) => ({
            user: state.user ? { ...state.user, accessToken: newToken } : null,
          }))
          return newToken
        } catch {
          set({ user: null })
          return null
        }
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)
