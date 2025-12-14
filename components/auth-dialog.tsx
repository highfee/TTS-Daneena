"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Phone } from "lucide-react"
import { useAuthStore } from "@/store/use-auth-store"
import { useState } from "react"

export function AuthDialog() {
  const { isAuthDialogOpen, closeAuthDialog, setUser } = useAuthStore()
  const [email, setEmail] = useState("")

  const handleContinue = () => {
    if (email) {
      // Mock authentication - replace with real auth
      setUser({
        id: Math.random().toString(36).substr(2, 9),
        email: email,
        name: email.split("@")[0],
      })
    }
  }

  const handleOAuthLogin = (provider: string) => {
    // Mock OAuth login - replace with real OAuth
    setUser({
      id: Math.random().toString(36).substr(2, 9),
      email: `user@${provider}.com`,
      name: `${provider} User`,
    })
  }

  return (
    <Dialog open={isAuthDialogOpen} onOpenChange={closeAuthDialog}>
      <DialogContent className="max-w-md border-border/40 bg-[#2f2f2f] p-0 text-white sm:rounded-2xl">
        <div className="relative p-8">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 h-8 w-8 rounded-full hover:bg-white/10"
            onClick={closeAuthDialog}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="mb-8 text-center">
            <h2 className="mb-3 text-2xl font-semibold">Log in or sign up</h2>
            <p className="text-sm text-gray-400">
              You'll get smarter responses and can upload files, images, and more.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-center gap-3 border-border/40 bg-transparent py-6 text-base font-normal hover:bg-white/5"
              onClick={() => handleOAuthLogin("google")}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full justify-center gap-3 border-border/40 bg-transparent py-6 text-base font-normal hover:bg-white/5"
              onClick={() => handleOAuthLogin("apple")}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Continue with Apple
            </Button>

            <Button
              variant="outline"
              className="w-full justify-center gap-3 border-border/40 bg-transparent py-6 text-base font-normal hover:bg-white/5"
              onClick={() => handleOAuthLogin("microsoft")}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#f25022" d="M11.4 11.4H2V2h9.4v9.4z" />
                <path fill="#00a4ef" d="M22 11.4h-9.4V2H22v9.4z" />
                <path fill="#7fba00" d="M11.4 22H2v-9.4h9.4V22z" />
                <path fill="#ffb900" d="M22 22h-9.4v-9.4H22V22z" />
              </svg>
              Continue with Microsoft
            </Button>

            <Button
              variant="outline"
              className="w-full justify-center gap-3 border-border/40 bg-transparent py-6 text-base font-normal hover:bg-white/5"
              onClick={() => handleOAuthLogin("phone")}
            >
              <Phone className="h-5 w-5" />
              Continue with phone
            </Button>
          </div>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border/40" />
            <span className="text-sm text-gray-500">OR</span>
            <div className="h-px flex-1 bg-border/40" />
          </div>

          <div className="space-y-3">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-border/40 bg-transparent py-6 text-base placeholder:text-gray-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleContinue()
                }
              }}
            />

            <Button
              className="w-full bg-white py-6 text-base font-medium text-black hover:bg-gray-200"
              onClick={handleContinue}
            >
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
