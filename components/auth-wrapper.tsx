"use client"

import { Header } from "@/components/header"
import { MessageList } from "@/components/message-list"
import { InputArea } from "@/components/input-area"
import { Sidebar } from "@/components/sidebar"
import { useAuthStore } from "@/store/use-auth-store"
import { useTTSStore } from "@/store/use-tts-store"
import { useEffect } from "react"

export function AuthWrapper() {
  const { user } = useAuthStore()
  const { isSidebarOpen, toggleSidebar, clearChats } = useTTSStore()

  useEffect(() => {
    if (!user) {
      clearChats()
    }
  }, [user, clearChats])

  return (
    <div className={user ? "flex h-screen overflow-hidden" : "flex h-screen flex-col"}>
      {user && (
        <>
          <Sidebar />
          {isSidebarOpen && (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden" onClick={toggleSidebar} />
          )}
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden relative">
        <Header />

        <main className="flex-1 overflow-y-auto pb-32 md:pb-0">
          <div className="container mx-auto max-w-4xl">
            <MessageList />
          </div>
        </main>

        <div className="fixed bottom-0 left-0 right-0 z-30 md:relative md:bg-transparent">
          <InputArea />
        </div>
      </div>
    </div>
  )
}
