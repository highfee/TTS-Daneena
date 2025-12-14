"use client"

import { useTTSStore } from "@/store/use-tts-store"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PanelLeft, Plus, MessageSquare, Trash2, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const { chats, activeChatId, isSidebarOpen, createNewChat, setActiveChat, deleteChat, toggleSidebar } = useTTSStore()

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col border-r bg-background transition-all duration-300",
        isSidebarOpen ? "w-64" : "w-14",
      )}
    >
      {/* Toggle Button */}
      <div className="flex h-14 items-center border-b px-2">
        <Button variant="ghost" size="icon" className="h-10 w-10" onClick={toggleSidebar}>
          <PanelLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar Content - Only visible when open */}
      {isSidebarOpen && (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* New Chat Button */}
          <div className="border-b p-2">
            <Button onClick={createNewChat} className="w-full gap-2" size="sm">
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </div>

          {/* Chat List */}
          <ScrollArea className="flex-1">
            <div className="space-y-1 p-2">
              {chats.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">No chats yet</div>
              ) : (
                chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={cn(
                      "group relative flex items-center gap-2 rounded-lg p-3 hover:bg-accent cursor-pointer",
                      activeChatId === chat.id && "bg-accent",
                    )}
                    onClick={() => setActiveChat(chat.id)}
                  >
                    <div className="flex flex-1 items-start gap-2">
                      <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{chat.title}</p>
                        <p className="text-xs text-muted-foreground">{chat.messages.length} messages</p>
                      </div>
                    </div>

                    {/* Delete Button */}
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
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteChat(chat.id)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </aside>
  )
}
