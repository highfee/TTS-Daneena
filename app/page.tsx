"use client"

import { MessageList } from "@/components/message-list"
import { useEffect } from "react"
import { useTTSStore } from "@/store/use-tts-store"

export default function Home() {
  const setActiveChat = useTTSStore((state) => state.setActiveChat)

  useEffect(() => {
    setActiveChat("")
  }, [setActiveChat])

  return (
    <div className="container mx-auto max-w-4xl py-6">
      <MessageList />
    </div>
  )
}
