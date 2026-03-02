"use client"

import { useTTSStore } from "@/store/use-tts-store"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, MessageSquare, Trash2, MoreVertical, ChevronRight, BarChart3 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/store/use-auth-store"

export function Sidebar() {
  const { chats, activeChatId, isSidebarOpen, persistChat, createNewChat, setActiveChat, deleteChat, toggleSidebar, fetchChats } = useTTSStore()
  const { user } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (user) {
      fetchChats()
    }
  }, [user, fetchChats])

  const handleNewChat = () => {
    setActiveChat("")
    router.push("/")
  }

  const handleSelectChat = (chatId: string) => {
    setActiveChat(chatId)
    router.push(`/chat/${chatId}`)
  }

  const collapsed = !isSidebarOpen

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-background transition-all duration-300 md:relative md:translate-x-0",
          // Mobile: collapse with animation
          isSidebarOpen ? "w-64 translate-x-0" : "w-14 -translate-x-full md:w-14 md:translate-x-0",
          // Desktop: smooth width transition
          "md:w-auto",
        )}
        style={!collapsed ? { width: "16rem" } : { width: "3.5rem" }}
      >
        {/* Header with Toggle Button */}
        <div className="flex h-14 items-center justify-between border-b px-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={toggleSidebar}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronRight className={cn("h-5 w-5 transition-transform", collapsed ? "rotate-180" : "")} />
          </Button>
        </div>

        {/* Analytics Link - Quick Access */}
        <div className={cn("border-b p-2", collapsed && "hidden md:block")}>
            <Link href="/analytics">
                <Button 
                    variant="ghost" 
                    className={cn(
                        "w-full gap-2 justify-start hover:bg-blue-500/10 hover:text-blue-400 transition-all",
                        pathname === "/analytics" && "bg-blue-500/10 text-blue-400"
                    )} 
                    size="sm"
                >
                    <BarChart3 className="h-4 w-4" />
                    {!collapsed && <span className="font-semibold tracking-tight">System Analytics</span>}
                </Button>
            </Link>
        </div>

        {/* Sidebar Content */}
        <div className={cn("flex flex-1 flex-col overflow-hidden", collapsed && "hidden md:flex")}>
          {/* New Chat Button */}
          <div className="border-b p-2">
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleNewChat} variant="default" size="icon" className="h-10 w-10">
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">New Chat</TooltipContent>
              </Tooltip>
            ) : (
              <Button onClick={handleNewChat} className="w-full gap-2" size="sm">
                <Plus className="h-4 w-4" />
                <span>New Chat</span>
              </Button>
            )}
          </div>

          {/* Chat List */}
          <ScrollArea className="flex-1">
            <div className={cn("space-y-1", collapsed ? "p-1" : "p-2")}>
              {chats.length === 0 ? (
                <div className={cn("text-center text-muted-foreground", collapsed ? "py-4 text-xs" : "py-8 text-sm")}>
                  {collapsed ? "No chats" : "No chats yet"}
                </div>
              ) : (
                chats.map((chat) => (
                  <Tooltip key={chat.id}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "group relative flex items-center gap-2 rounded-lg p-3 hover:bg-accent cursor-pointer transition-colors",
                          activeChatId === chat.id && "bg-accent",
                          collapsed && "justify-center p-2",
                        )}
                        onClick={() => handleSelectChat(chat.id)}
                      >
                        {collapsed ? (
                          <MessageSquare className="h-5 w-5 shrink-0 text-muted-foreground" />
                        ) : (
                          <>
                            <div className="flex flex-1 items-start gap-2 overflow-hidden">
                              <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold leading-tight text-foreground group-hover:text-blue-400 transition-colors">
                                  {chat.title}
                                </p>
                                <p className="text-[10px] text-blue-400/60 font-medium uppercase tracking-wider">
                                  {chat.messages.length} messages
                                </p>
                              </div>
                            </div>

                            {/* Delete Button - Only visible when expanded */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    const isActive = activeChatId === chat.id
                                    await deleteChat(chat.id)
                                    if (isActive) {
                                      router.push("/")
                                    }
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        )}
                      </div>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="max-w-xs">{chat.title}</p>
                        <p className="text-xs text-muted-foreground">{chat.messages.length} messages</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </aside>
    </TooltipProvider>
  )
}
