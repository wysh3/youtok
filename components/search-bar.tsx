"use client"

import type React from "react"

import { useState } from "react"
import { SearchIcon, LinkIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useVideo } from "@/context/video-context"
import { extractVideoId } from "@/lib/youtube-api"
import SearchHistory from "@/components/search-history"

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const [isInputFocused, setIsInputFocused] = useState(false)
  const { searchVideos } = useVideo()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    try {
      // Check if the query is a YouTube URL
      const videoId = extractVideoId(query)
      if (videoId) {
        // If it's a URL, search for that specific video
        await searchVideos(query, true)
      } else {
        // Otherwise, perform a regular search
        await searchVideos(query, false)
      }
      // Close the search history dropdown after search
      setIsInputFocused(false)
    } catch (error) {
      console.error('Error during search:', error)
    }
  }

  return (
    <form onSubmit={handleSearch} className="p-2">
      <div className="flex w-full items-center space-x-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search or paste YouTube link..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={(e) => {
              // Only hide search history if clicking outside the form
              if (!e.currentTarget.form?.contains(e.relatedTarget as Node)) {
                setIsInputFocused(false)
              }
            }}
            className="pr-10 glassmorphic backdrop-blur-lg bg-background/30 dark:bg-background/20 dark:text-foreground border-none"
          />
          {extractVideoId(query) && (
            <LinkIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary link-icon-animate" />
          )}
          {isInputFocused && (
            <div className="absolute w-full mt-1 glassmorphic backdrop-blur-xl bg-background/30 dark:bg-background/20 border-none shadow-lg shadow-black/10 dark:shadow-black/30 z-50">
              <SearchHistory />
            </div>
          )}
        </div>
        <Button type="submit" size="icon" className="glassmorphic frosted-glass-hover backdrop-blur-lg bg-background/30 dark:bg-background/20 hover:bg-background/40 dark:hover:bg-background/30 border-none">
          <SearchIcon className="h-4 w-4 text-white search-icon-animate" />
          <span className="sr-only">Search</span>
        </Button>
      </div>
    </form>
  )
}

