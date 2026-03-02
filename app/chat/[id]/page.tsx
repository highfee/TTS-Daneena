"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { MessageList } from "@/components/message-list"
import { InputArea } from "@/components/input-area"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { useTTSStore } from "@/store/use-tts-store"
import { useAuthStore } from "@/store/use-auth-store"

export default function ChatPage() {
  const params = useParams()
  const chatId = params.id as string
  const { setActiveChat, fetchChats } = useTTSStore()
  const { user } = useAuthStore()

  useEffect(() => {
    if (chatId) {
      setActiveChat(chatId)
    }
  }, [chatId, setActiveChat])

  useEffect(() => {
    if (user) {
      fetchChats()
    }
  }, [user, fetchChats])

  if (!user) {
    return (
      <div className="flex h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Please log in to view this chat.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl py-6">
      <MessageList />
    </div>
  )
}
