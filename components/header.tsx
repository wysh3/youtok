"use client"

import { useState } from "react"
import { Search, Menu, X, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </Button>

          <Link href="/" className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-100">
            YouTok
          </Link>
        </div>

        <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Input
              type="search"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glassmorphic backdrop-blur-lg bg-background/30 dark:bg-background/20 focus-visible:ring-gray-500"
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="absolute right-0 top-0 h-full frosted-glass-hover"
            >
              <Search className="h-4 w-4 search-icon-animate" />
            </Button>
          </div>
        </form>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="frosted-glass-hover"
          >
            <Bell className="h-5 w-5 svg-pulse" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="frosted-glass-hover"
          >
            <User className="h-5 w-5 svg-fade-in" />
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto p-4 flex flex-col gap-2">
            <Link
              href="/"
              className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/favorites"
              className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Favorites
            </Link>
            <Link
              href="/history"
              className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              History
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}