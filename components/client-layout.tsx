"use client"

import { OAuthProviders } from "@/components/oauth-providers"
import { Header } from "@/components/header"
import { InputArea } from "@/components/input-area"
import { Sidebar } from "@/components/sidebar"
import { useAuthStore } from "@/store/use-auth-store"
import { useTTSStore } from "@/store/use-tts-store"
import { useEffect } from "react"
import { AuthDialog } from "@/components/auth-dialog"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  const { isSidebarOpen, toggleSidebar, clearChats, isZenMode } = useTTSStore()

  useEffect(() => {
    if (!user) {
      clearChats()
    }
  }, [user, clearChats])

  return (
    <OAuthProviders>
    <div className={user ? "flex h-screen overflow-hidden" : "flex h-screen flex-col"}>
      {user && !isZenMode && (
        <>
          <Sidebar />
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm sm:hidden" 
              onClick={toggleSidebar} 
            />
          )}
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden relative">
        <Header />

        <main className="flex-1 overflow-y-auto pb-32 md:pb-0">
          {children}
        </main>

        <div className="fixed bottom-0 left-0 right-0 z-30 md:relative md:bg-transparent">
          <InputArea />
        </div>
      </div>
      
      <AuthDialog />
      <Toaster />
    </div>
    </OAuthProviders>
  )
}
