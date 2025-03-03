"use client"

import type React from "react"

import { useState } from "react"
import { SearchIcon, LinkIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useVideo } from "@/context/video-context"
import { extractVideoId } from "@/lib/youtube-api"

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const { searchVideos } = useVideo()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Check if the query is a YouTube URL
    const videoId = extractVideoId(query)
    if (videoId) {
      // If it's a URL, search for that specific video
      searchVideos(query, true)
    } else {
      // Otherwise, perform a regular search
      searchVideos(query, false)
    }
  }

  return (
    <form onSubmit={handleSearch} className="p-4">
      <div className="flex w-full items-center space-x-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search or paste YouTube link..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pr-10"
          />
          {extractVideoId(query) && (
            <LinkIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary" />
          )}
        </div>
        <Button type="submit" size="icon">
          <SearchIcon className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </div>
    </form>
  )
}

