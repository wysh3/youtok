import type React from "react"
import type { Metadata } from "next"
import { Inter, Oswald } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"
import dynamic from "next/dynamic"

const Toaster = dynamic(() => import("@/components/ui/toaster").then(mod => ({ default: mod.Toaster })), { ssr: false })
// const VideoProvider = dynamic(() => import("@/context/video-context").then(mod => ({ default: mod.VideoProvider }))) // Removed old provider
const ThemeProvider = dynamic(() => import("@/components/theme-provider").then(mod => ({ default: mod.ThemeProvider })))
const SettingsProvider = dynamic(() => import("@/context/settings-context").then(mod => ({ default: mod.SettingsProvider })))
const HistoryProvider = dynamic(() => import("@/context/history-context").then(mod => ({ default: mod.HistoryProvider })))
const FavoritesProvider = dynamic(() => import("@/context/favorites-context").then(mod => ({ default: mod.FavoritesProvider })))
const SearchProvider = dynamic(() => import("@/context/search-context").then(mod => ({ default: mod.SearchProvider })))
const VideoFeedProvider = dynamic(() => import("@/context/video-feed-context").then(mod => ({ default: mod.VideoFeedProvider })))

const inter = Inter({ subsets: ["latin"] })
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" })

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
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body className={`${inter.className} ${oswald.variable} min-h-screen bg-background font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
          <SettingsProvider>
            <HistoryProvider>
              <FavoritesProvider>
                <SearchProvider>
                  <VideoFeedProvider>
                    {children}
                    <Toaster />
                  </VideoFeedProvider>
                </SearchProvider>
              </FavoritesProvider>
            </HistoryProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}