import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"
import dynamic from "next/dynamic"

const Toaster = dynamic(() => import("@/components/ui/toaster").then(mod => ({ default: mod.Toaster })), { ssr: false })
const VideoProvider = dynamic(() => import("@/context/video-context").then(mod => ({ default: mod.VideoProvider })))
const ThemeProvider = dynamic(() => import("@/components/theme-provider").then(mod => ({ default: mod.ThemeProvider })))

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "YouTok",
  description: "YouTube video summaries in a reels-style feed"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="color-scheme" content="dark light" />
      </head>
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <VideoProvider>
            {children}
            <Toaster />
          </VideoProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}