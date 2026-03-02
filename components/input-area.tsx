"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useTTSStore } from "@/store/use-tts-store"
import { SendHorizontal, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/use-auth-store"
import { apiFetch } from "@/lib/api-fetch"

export function InputArea() {
  const [text, setText] = useState("")
  const { addMessage, setProcessing, isProcessing, activeChatId, persistChat, createNewChat } = useTTSStore()
  const { toast } = useToast()
  const { user } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async () => {
    if (!text.trim() || isProcessing) return

    let chatId = activeChatId

    setProcessing(true)

    // If no active chat, create one
    if (!chatId) {
      const title = text.slice(0, 30) + (text.length > 30 ? "..." : "")
      
      if (user) {
        // Authenticated users: persist to backend
        chatId = await persistChat(title)
        if (!chatId) {
          setProcessing(false)
          return
        }
        // Navigate to the new chat URL
        router.push(`/chat/${chatId}`)
      } else {
        // Guest users: create local-only chat
        createNewChat(title)
        // Get the newly created local chatId from store
        chatId = useTTSStore.getState().activeChatId
      }
    }

    // Add user message to the (now guaranteed) active chat
    addMessage({ type: "user", text })

    try {
      const response = await apiFetch("/api/tts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          chat_id: user ? chatId : null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to call TTS API")
      }

      const data = await response.json()

      addMessage({
        id: data.id,
        type: "system",
        text: data.input_text,
        emotion: data.emotion as "happy" | "sad" | "neutral",
        confidence: data.confidence,
        audioUrl: data.audio_url,
        requestId: data.id,
      })

      setText("")
    } catch (error) {
      console.error("TTS Error:", error)
      toast({
        title: "Error",
        description: "Failed to generate speech. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-4 md:bg-background">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-end gap-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter text to convert to speech... (Press Enter to submit, Shift+Enter for new line)"
            className="min-h-[60px] max-h-[200px] resize-none"
            disabled={isProcessing}
          />
          <Button
            onClick={handleSubmit}
            disabled={!text.trim() || isProcessing}
            size="icon"
            className="h-[60px] w-[60px] shrink-0"
          >
            {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizontal className="h-5 w-5" />}
          </Button>
        </div>

        {isProcessing && (
          <p className="mt-2 text-xs text-muted-foreground">
            Processing your text... Detecting emotion and generating speech
          </p>
        )}
      </div>
    </div>
  )
}
