"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import VideoCard from "@/components/video-card"
import { useVideo } from "@/context/video-context"
import { Loader2 } from "lucide-react"

export default function SearchResults() {
  const { searchResults, searchQuery, isSearching, loadMoreSearchResults, hasMoreSearchResults } = useVideo()
  const [loadingMore, setLoadingMore] = useState(false)
  const observerTarget = useRef(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0]
      if (target.isIntersecting && !loadingMore && hasMoreSearchResults) {
        setLoadingMore(true)
        loadMoreSearchResults().finally(() => setLoadingMore(false))
      }
    },
    [loadingMore, hasMoreSearchResults, loadMoreSearchResults]
  )

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "20px",
      threshold: 1.0,
    })

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [handleObserver])

  if (isSearching && searchResults.length === 0) {
    return (
      <div className="w-full p-4 flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="w-full p-4">
      <h2 className="text-lg font-medium mb-4">
        Search results for "{searchQuery}"
      </h2>
      {searchResults.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No videos found</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {searchResults.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
          <div ref={observerTarget} className="h-10 flex items-center justify-center mt-4">
            {loadingMore && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
          </div>
        </>
      )}
    </div>
  )
}

