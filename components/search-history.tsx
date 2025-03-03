"use client"

import { useVideo } from "@/context/video-context"
import { Button } from "@/components/ui/button"
import { Trash2, Clock } from "lucide-react"

export default function SearchHistory() {
  const { searchHistory, clearSearchHistory, searchVideos } = useVideo()

  if (searchHistory.length === 0) {
    return null
  }

  return (
    <div className="px-4 pb-2 mt-2">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          Recent Searches
        </div>
        <Button variant="ghost" size="sm" onClick={clearSearchHistory} className="h-6 px-2">
          <Trash2 className="h-3 w-3" />
          <span className="sr-only">Clear search history</span>
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {searchHistory.map((query) => (
          <Button
            key={query}
            variant="secondary"
            size="sm"
            className="text-xs"
            onClick={() => searchVideos(query, false)}
          >
            {query}
          </Button>
        ))}
      </div>
    </div>
  )
}