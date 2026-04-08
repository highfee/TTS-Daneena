"use client";

import { Button } from "@/components/ui/button";
import { Settings, Sparkles, Menu, Maximize2, Minimize2 } from "lucide-react";
import { ModelSelector } from "./model-selector";
import { useState } from "react";
import { useAuthStore } from "@/store/use-auth-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTTSStore } from "@/store/use-tts-store";
import { useRouter } from "next/navigation";

export function Header() {
  const [showModelSelector, setShowModelSelector] = useState(false);
  const router = useRouter();
  const { user, openAuthDialog, logout } = useAuthStore();
  const { isZenMode, toggleZenMode, toggleSidebar } = useTTSStore();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={toggleSidebar}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-slate-500 shadow-sm border border-white/10">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold shrink-0 tracking-tight">
              EA-TTS
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowModelSelector(true)}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              AI Models
            </Button>

            {user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleZenMode}
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                title={isZenMode ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isZenMode ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            )}

            {!user ? (
              <Button onClick={openAuthDialog} size="sm">
                Log in
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-600 text-xs text-white">
                        {user.name?.charAt(0).toUpperCase() ||
                          user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-sm">
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-sm text-red-600"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      <ModelSelector
        open={showModelSelector}
        onOpenChange={setShowModelSelector}
      />
    </>
  );
}
