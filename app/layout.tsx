import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EA-TTS - Emotion-Adaptive Text-to-Speech",
  description: "Convert text to emotionally expressive speech using AI",
  generator: "v0.app",
  icons: {
    icon: "/classic-studio-microphone.png",
    apple: "/classic-studio-microphone.png",
  },
}

import { ClientLayout } from "@/components/client-layout"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ClientLayout>{children}</ClientLayout>
        <Analytics />
      </body>
    </html>
  )
}
