"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import VideoCard from "@/components/video-card"
import { useVideo } from "@/context/video-context"
import { fetchTrendingVideos } from "@/lib/youtube-api"
import { Loader2 } from "lucide-react"

export default function Feed() {
  const { videos, setVideos, settings, loadMoreTrendingVideos, hasMoreTrending } = useVideo()
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const observerTarget = useRef(null)

  useEffect(() => {
    async function loadTrendingVideos() {
      setLoading(true)
      try {
        const trendingVideos = await fetchTrendingVideos(settings.trendingTopic, 1)
        setVideos(trendingVideos)
      } catch (error) {
        console.error("Error fetching trending videos:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTrendingVideos()
  }, [setVideos, settings.trendingTopic])

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0]
      if (target.isIntersecting && !loadingMore && hasMoreTrending) {
        setLoadingMore(true)
        loadMoreTrendingVideos().finally(() => setLoadingMore(false))
      }
    },
    [loadingMore, hasMoreTrending, loadMoreTrendingVideos]
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
  if (loading) {
    return (
      <div className="w-full p-4 flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  return (
    <div className="w-full p-4">
      <h2 className="text-lg font-medium mb-4">Trending in {settings.trendingTopic}</h2>
      {videos.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No videos to display</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {videos.map((video) => (
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

