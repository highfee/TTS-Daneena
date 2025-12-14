"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useTTSStore } from "@/store/use-tts-store"
import { SendHorizontal, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function InputArea() {
  const [text, setText] = useState("")
  const { addMessage, setProcessing, isProcessing, createNewChat, activeChatId } = useTTSStore()
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!text.trim() || isProcessing) return

    if (!activeChatId) {
      createNewChat()
    }

    // Add user message
    addMessage({ type: "user", text })

    setProcessing(true)

    try {
      // TODO: Replace with actual API call
      // Simulating API call for demo purposes
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock response - Replace with actual API response
      const mockEmotions: Array<"happy" | "sad" | "neutral"> = ["happy", "sad", "neutral"]
      const randomEmotion = mockEmotions[Math.floor(Math.random() * mockEmotions.length)]

      addMessage({
        type: "system",
        emotion: randomEmotion,
        confidence: 0.75 + Math.random() * 0.25,
        audioUrl: "/placeholder-audio.mp3", // Replace with actual audio URL from API
      })

      setText("")
    } catch (error) {
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
    <div className="border-t border-border bg-background px-4 py-4">
      <div className="container mx-auto max-w-4xl">
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
