import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useAuthStore } from "./use-auth-store"
import { apiFetch } from "@/lib/api-fetch"

export type EmotionType = "happy" | "sad" | "neutral" | "angry" | "fear" | "surprise"

export interface Message {
  id: string
  type: "user" | "system"
  text?: string
  emotion?: EmotionType
  confidence?: number
  audioUrl?: string
  requestId?: string
  timestamp: Date
}

export interface AIModel {
  emotionModel: string
  speechModel: string
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

interface TTSStore {
  chats: Chat[]
  activeChatId: string | null
  isProcessing: boolean
  isSidebarOpen: boolean
  aiModel: AIModel

  fetchChats: () => Promise<void>
  persistChat: (title: string) => Promise<string>
  setActiveChat: (chatId: string) => void
  deleteChat: (chatId: string) => Promise<void>
  createNewChat: (title?: string) => void
  addMessage: (message: Omit<Message, "id" | "timestamp"> & { id?: string }) => void
  updateMessage: (id: string, updates: Partial<Message>) => void
  isZenMode: boolean
  toggleZenMode: () => void
  setProcessing: (processing: boolean) => void
  setAIModel: (model: AIModel) => void
  toggleSidebar: () => void
  getActiveChat: () => Chat | undefined
  clearChats: () => void
}

export const useTTSStore = create<TTSStore>()(
  persist(
    (set, get) => ({
      chats: [],
      activeChatId: null,
      isProcessing: false,
      isSidebarOpen: true,
      aiModel: {
        emotionModel: "BERT (GoEmotions Fine-Tuned)",
        speechModel: "FastSpeech 2 + HiFi-GAN",
      },
      isZenMode: false,

      toggleZenMode: () => set((state) => ({ isZenMode: !state.isZenMode })),

      fetchChats: async () => {
        try {
          const res = await apiFetch("/api/chats")
          if (res.ok) {
            const rawChats = await res.json()
            const backendChats: Chat[] = rawChats.map((c: any) => ({
              id: c.id,
              title: c.title,
              messages: (c.messages || []).flatMap((m: any) => [
                {
                  id: `user-${m.id}`,
                  type: "user",
                  text: m.input_text,
                  timestamp: new Date(m.created_at),
                },
                {
                  id: m.id,
                  type: "system",
                  text: m.input_text,
                  emotion: m.detected_emotion as EmotionType,
                  confidence: m.confidence_score,
                  audioUrl: `/api/tts/audio/${m.id}`,
                  requestId: m.id,
                  timestamp: new Date(m.created_at),
                },
              ]),
              createdAt: new Date(c.created_at),
              updatedAt: new Date(c.updated_at),
            }))

            set((state) => {
              // Merge backend chats with local chats to preserve messages being added
              const mergedChats = [...backendChats]

              state.chats.forEach(localChat => {
                const backendIndex = mergedChats.findIndex(bc => bc.id === localChat.id)
                if (backendIndex >= 0) {
                  // If local has more messages (likely just sent), keep local messages
                  if (localChat.messages.length > mergedChats[backendIndex].messages.length) {
                    mergedChats[backendIndex].messages = localChat.messages
                  }
                } else if (localChat.id.match(/^[a-z0-9]{9}$/)) {
                  // Keep guest/local-only chats
                  mergedChats.push(localChat)
                }
              })

              return { chats: mergedChats }
            })
          }
        } catch (error) {
          console.error("Failed to fetch chats:", error)
        }
      },

      persistChat: async (title: string) => {
        try {
          const res = await apiFetch("/api/chats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title }),
          })
          if (res.ok) {
            const newChat = await res.json()
            set((state) => ({
              chats: [newChat, ...state.chats],
              activeChatId: newChat.id,
            }))
            return newChat.id
          }
        } catch (error) {
          console.error("Failed to create chat:", error)
        }
        return ""
      },

      createNewChat: (title?: string) => {
        const newChat: Chat = {
          id: Math.random().toString(36).substr(2, 9),
          title: title || "New Chat",
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({
          chats: [newChat, ...state.chats],
          activeChatId: newChat.id,
        }))
      },

      setActiveChat: (chatId) => {
        set({ activeChatId: chatId })
      },

      deleteChat: async (chatId) => {
        try {
          const isLocalId = chatId.match(/^[a-z0-9]{9}$/)
          const { user } = useAuthStore.getState()

          if (user && !isLocalId) {
            await apiFetch(`/api/chats/${chatId}`, { method: "DELETE" })
          }
        } catch (error) {
          console.error("Failed to delete chat from server:", error)
        }

        set((state) => {
          const filteredChats = state.chats.filter((c) => c.id !== chatId)
          const newActiveChatId = state.activeChatId === chatId ? filteredChats[0]?.id || null : state.activeChatId
          return {
            chats: filteredChats,
            activeChatId: newActiveChatId,
          }
        })
      },

      addMessage: (message) =>
        set((state) => {
          let currentActiveChatId = state.activeChatId
          let currentChats = state.chats

          if (!currentActiveChatId) {
            const newChat: Chat = {
              id: Math.random().toString(36).substr(2, 9),
              title: "New Chat",
              messages: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            currentChats = [newChat, ...currentChats]
            currentActiveChatId = newChat.id
          }

          const activeChat = currentChats.find((c) => c.id === currentActiveChatId)
          if (!activeChat) return state

          const newMessage: Message = {
            id: message.id || Math.random().toString(36).substr(2, 9),
            ...message,
            timestamp: new Date(),
          }

          const updatedChats = currentChats.map((chat) => {
            if (chat.id === currentActiveChatId) {
              const title =
                chat.messages.length === 0 && message.type === "user" && message.text
                  ? message.text.slice(0, 30) + (message.text.length > 30 ? "..." : "")
                  : chat.title

              return {
                ...chat,
                title,
                messages: [...chat.messages, newMessage],
                updatedAt: new Date(),
              }
            }
            return chat
          })

          return {
            chats: updatedChats,
            activeChatId: currentActiveChatId,
          }
        }),

      updateMessage: (id, updates) =>
        set((state) => ({
          chats: state.chats.map((chat) => ({
            ...chat,
            messages: chat.messages.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg)),
          })),
        })),

      setProcessing: (processing) => set({ isProcessing: processing }),
      setAIModel: (model) => set({ aiModel: model }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      getActiveChat: () => {
        const state = get()
        return state.chats.find((c) => c.id === state.activeChatId)
      },
      clearChats: () => {
        set({ chats: [], activeChatId: null })
      },
    }),
    {
      name: "tts-storage",
    },
  ),
)
