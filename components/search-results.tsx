"use client"

import { useEffect, useState } from "react"
import { useVideo } from "@/context/video-context"
import { Loader2 } from "lucide-react"
import { InfiniteFeed } from "@/components/infinite-feed"

export default function SearchResults() {
  const { searchResults, searchQuery, isSearching, loadMoreSearchResults, hasMoreSearchResults } = useVideo()
  const [loadingMore, setLoadingMore] = useState(false)
  
  const handleLoadMore = async () => {
    if (!loadingMore && hasMoreSearchResults) {
      setLoadingMore(true)
      try {
        await loadMoreSearchResults()
      } finally {
        setLoadingMore(false)
      }
    }
  }

  if (isSearching && searchResults.length === 0) {
    return (
      <div className="w-full p-4 flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary svg-pulse" />
      </div>
    )
  }

  if (!searchQuery.trim()) {
    return (
      <div className="w-full p-4">
        <div className="text-center py-10 glassmorphic backdrop-blur-lg rounded-lg p-4">
          <p className="text-muted-foreground">Type a search term or paste a YouTube URL to discover videos</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full p-4">
      {searchQuery && (
        <h2 className="text-lg font-medium mb-4">
          Search results for "{searchQuery}"
        </h2>
      )}
      {searchResults.length === 0 ? (
        <div className="text-center py-10 glassmorphic backdrop-blur-lg rounded-lg p-4">
          <p className="text-muted-foreground">No videos found</p>
        </div>
      ) : (
        <div className="svg-fade-in">
          <InfiniteFeed
            videos={searchResults}
            onLoadMore={handleLoadMore}
            hasMore={hasMoreSearchResults}
            isLoading={loadingMore}
          />
        </div>
      )}
    </div>
  )
}

