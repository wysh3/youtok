global.css : @tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 5.9% 10%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

.glass-card {
  @apply bg-glass backdrop-blur-md border border-white/10;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.text-gradient {
  @apply bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400;
}



layout.tsx : 
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "YouTok - Modern Video Platform",
  description: "A modern video platform with infinite scrolling",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="youtok-theme">
          <Header />
          <div className="flex min-h-screen pt-16">
            <Sidebar />
            <main className="flex-1 md:ml-64">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

page.tsx :
import { InfiniteFeed } from "@/components/infinite-feed"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="fixed bottom-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <InfiniteFeed />
    </div>
  )
}

button.tsx: 
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }

input.tsx : 
import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }

header.tsx :
"use client"

import { useState, useEffect } from "react"
import { Search, Menu, X, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <a href="/" className="flex items-center">
              <span className="text-xl font-bold text-gradient">YouTok</span>
            </a>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center max-w-md w-full mx-4">
            <div className="relative w-full">
              <Input
                type="search"
                placeholder="Search videos..."
                className="w-full pl-10 pr-4 py-2 rounded-full bg-secondary/50 border-none focus-visible:ring-primary"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t">
          <div className="container mx-auto py-4 px-4 space-y-4">
            <div className="relative w-full">
              <Input
                type="search"
                placeholder="Search videos..."
                className="w-full pl-10 pr-4 py-2 rounded-full bg-secondary/50 border-none"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <nav className="space-y-2">
              <a href="/" className="flex items-center p-2 rounded-md hover:bg-secondary">
                Home
              </a>
              <a href="/trending" className="flex items-center p-2 rounded-md hover:bg-secondary">
                Trending
              </a>
              <a href="/subscriptions" className="flex items-center p-2 rounded-md hover:bg-secondary">
                Subscriptions
              </a>
              <a href="/library" className="flex items-center p-2 rounded-md hover:bg-secondary">
                Library
              </a>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

infinite-feed.tsx :
"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { VideoCard } from "./video-card"

// Mock data generator for videos
const generateMockVideo = (index: number) => {
  const id = `video-${index}`
  const titles = [
    "How to master modern web development in 2023",
    "10 tips for better productivity with VS Code",
    "Building a full-stack app with Next.js and Tailwind",
    "The future of AI in everyday applications",
    "Why TypeScript is essential for large projects",
  ]

  const creators = [
    { name: "TechGuru", avatar: "/placeholder.svg?height=36&width=36" },
    { name: "CodeMaster", avatar: "/placeholder.svg?height=36&width=36" },
    { name: "WebDev Pro", avatar: "/placeholder.svg?height=36&width=36" },
    { name: "DesignWhiz", avatar: "/placeholder.svg?height=36&width=36" },
    { name: "AIExplorer", avatar: "/placeholder.svg?height=36&width=36" },
  ]

  const randomTitle = titles[Math.floor(Math.random() * titles.length)]
  const randomCreator = creators[Math.floor(Math.random() * creators.length)]
  const randomViews = `${Math.floor(Math.random() * 900) + 100}K`
  const randomDays = Math.floor(Math.random() * 30) + 1

  return {
    id,
    title: randomTitle,
    thumbnail: `/placeholder.svg?height=200&width=350&text=Video+${index}`,
    views: randomViews,
    timestamp: `${randomDays} days ago`,
    creator: randomCreator,
  }
}

export function InfiniteFeed() {
  const [videos, setVideos] = useState<ReturnType<typeof generateMockVideo>[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const observer = useRef<IntersectionObserver | null>(null)

  // Load initial videos
  useEffect(() => {
    const initialVideos = Array.from({ length: 12 }, (_, i) => generateMockVideo(i))
    setVideos(initialVideos)
  }, [])

  // Function to load more videos
  const loadMoreVideos = useCallback(async () => {
    setLoading(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const newVideos = Array.from({ length: 8 }, (_, i) => generateMockVideo(videos.length + i))

    setVideos((prev) => [...prev, ...newVideos])
    setPage((prev) => prev + 1)
    setLoading(false)
  }, [videos.length])

  // Setup intersection observer for infinite scrolling
  const lastVideoElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return

      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadMoreVideos()
          }
        },
        { threshold: 0.5 },
      )

      if (node) observer.current.observe(node)
    },
    [loading, loadMoreVideos],
  )

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6 text-gradient">Recommended Videos</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {videos.map((video, index) => {
          if (videos.length === index + 1) {
            return (
              <div ref={lastVideoElementRef} key={video.id}>
                <VideoCard {...video} />
              </div>
            )
          } else {
            return <VideoCard key={video.id} {...video} />
          }
        })}
      </div>

      {loading && (
        <div className="flex justify-center my-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}

sidebar.tsx :
import {
  Home,
  TrendingUpIcon as Trending,
  ShoppingCartIcon as Subscriptions,
  History,
  VideoIcon as VideoLibrary,
  Clock,
  ThumbsUp,
  Settings,
} from "lucide-react"

export function Sidebar() {
  return (
    <aside className="hidden md:block w-64 fixed top-16 left-0 bottom-0 overflow-y-auto scrollbar-hide border-r border-border/50 pt-4">
      <nav className="space-y-1 px-3">
        <a href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-secondary/50">
          <Home className="h-5 w-5" />
          <span>Home</span>
        </a>
        <a href="/trending" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-secondary/50">
          <Trending className="h-5 w-5" />
          <span>Trending</span>
        </a>
        <a href="/subscriptions" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-secondary/50">
          <Subscriptions className="h-5 w-5" />
          <span>Subscriptions</span>
        </a>
      </nav>

      <div className="mt-6 pt-6 border-t border-border/50">
        <h3 className="px-6 mb-2 text-sm font-medium text-muted-foreground">Library</h3>
        <nav className="space-y-1 px-3">
          <a href="/history" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-secondary/50">
            <History className="h-5 w-5" />
            <span>History</span>
          </a>
          <a href="/your-videos" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-secondary/50">
            <VideoLibrary className="h-5 w-5" />
            <span>Your videos</span>
          </a>
          <a href="/watch-later" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-secondary/50">
            <Clock className="h-5 w-5" />
            <span>Watch later</span>
          </a>
          <a href="/liked-videos" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-secondary/50">
            <ThumbsUp className="h-5 w-5" />
            <span>Liked videos</span>
          </a>
        </nav>
      </div>

      <div className="mt-6 pt-6 border-t border-border/50">
        <h3 className="px-6 mb-2 text-sm font-medium text-muted-foreground">Settings</h3>
        <nav className="space-y-1 px-3">
          <a href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-secondary/50">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </a>
        </nav>
      </div>
    </aside>
  )
}

theme-provider.tsx :
"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "youtok-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey) as Theme | null

    if (savedTheme) {
      setTheme(savedTheme)
    } else if (defaultTheme === "system") {
      setTheme("system")
    }
  }, [defaultTheme, storageKey])

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")

  return context
}


theme-toggle.tsx: 
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "./theme-provider"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}


video-card.tsx: 
import Image from "next/image"
import { Play } from "lucide-react"

interface VideoCardProps {
  id: string
  title: string
  thumbnail: string
  views: string
  timestamp: string
  creator: {
    name: string
    avatar: string
  }
}

export function VideoCard({ id, title, thumbnail, views, timestamp, creator }: VideoCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02]">
      <div className="aspect-video relative overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
          <Play className="w-12 h-12 text-white" />
        </div>
        <Image
          src={thumbnail || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-3">
        <div className="flex gap-3 mt-2">
          <div className="h-9 w-9 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={creator.avatar || "/placeholder.svg"}
              alt={creator.name}
              width={36}
              height={36}
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="font-medium line-clamp-2 text-sm">{title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{creator.name}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <span>{views} views</span>
              <span>•</span>
              <span>{timestamp}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


utils.tsx :
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


tailwind.config.ts:
import { type Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}", "*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'noise': "url('/noise.png')",
        'glass': "linear-gradient(to right bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config


