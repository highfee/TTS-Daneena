import { Toaster } from "@/components/ui/toaster"
import { AuthDialog } from "@/components/auth-dialog"
import { AuthWrapper } from "@/components/auth-wrapper"

export default function Home() {
  return (
    <>
      <AuthWrapper />
      <AuthDialog />
      <Toaster />
    </>
  )
}
