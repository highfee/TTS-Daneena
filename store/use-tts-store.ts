import { create } from "zustand"
import { persist } from "zustand/middleware"

export type EmotionType = "happy" | "sad" | "neutral"

export interface Message {
  id: string
  type: "user" | "system"
  text?: string
  emotion?: EmotionType
  confidence?: number
  audioUrl?: string
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

  createNewChat: () => void
  setActiveChat: (chatId: string) => void
  deleteChat: (chatId: string) => void
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void
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

      createNewChat: () => {
        const newChat: Chat = {
          id: Math.random().toString(36).substr(2, 9),
          title: "New Chat",
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

      deleteChat: (chatId) =>
        set((state) => {
          const filteredChats = state.chats.filter((c) => c.id !== chatId)
          const newActiveChatId = state.activeChatId === chatId ? filteredChats[0]?.id || null : state.activeChatId
          return {
            chats: filteredChats,
            activeChatId: newActiveChatId,
          }
        }),

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
            ...message,
            id: Math.random().toString(36).substr(2, 9),
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
