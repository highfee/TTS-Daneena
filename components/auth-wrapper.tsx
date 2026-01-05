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
  const clearChats = useTTSStore((state) => state.clearChats)

  useEffect(() => {
    if (!user) {
      clearChats()
    }
  }, [user, clearChats])

  return (
    <div className={user ? "grid h-screen grid-cols-[auto_1fr]" : "flex h-screen flex-col"}>
      {user && <Sidebar />}

      <div className="flex min-w-0 flex-col">
        <Header />

        <main className="flex-1">
          <div className="container mx-auto max-w-4xl h-full">
            <MessageList />
          </div>
        </main>

        <InputArea />
      </div>
    </div>
  )
}
