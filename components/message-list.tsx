"use client"

import { useTTSStore, type Message } from "@/store/use-tts-store"
import { EmotionBadge } from "./emotion-badge"
import { AudioPlayer } from "./audio-player"
import { useEffect, useRef } from "react"
import { User, Bot } from "lucide-react"

export function MessageList() {
  const activeChatId = useTTSStore((state) => state.activeChatId)
  const chats = useTTSStore((state) => state.chats)
  const activeChat = chats.find((c) => c.id === activeChatId)

  const messages = activeChat?.messages || []
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
          <Bot className="h-8 w-8 text-white" />
        </div>
        <h2 className="mb-2 text-2xl font-semibold">Welcome to EA-TTS</h2>
        <p className="max-w-md text-balance text-muted-foreground">
          Enter text below and I'll convert it to emotionally expressive speech using advanced AI models
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}

function MessageItem({ message }: { message: Message }) {
  if (message.type === "user") {
    return (
      <div className="flex items-start justify-end gap-3">
        <div className="max-w-[80%] rounded-2xl bg-primary px-4 py-3 text-primary-foreground">
          <p className="text-sm leading-relaxed">{message.text}</p>
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
          <User className="h-4 w-4" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="max-w-[80%] space-y-3">
        {message.emotion && message.confidence && (
          <EmotionBadge emotion={message.emotion} confidence={message.confidence} />
        )}
        {message.audioUrl && <AudioPlayer audioUrl={message.audioUrl} />}
      </div>
    </div>
  )
}
