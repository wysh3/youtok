"use client"

import * as React from "react"
import VideoCard from "./video-card"
import { useVideo } from "@/context/video-context"
import { useInView } from "react-intersection-observer"
import { Loader2 } from "lucide-react"
import type { Video } from "@/types/video"

interface InfiniteFeedProps {
  videos: Video[]
  onLoadMore: () => Promise<void>
  hasMore: boolean
  isLoading?: boolean
}

export function InfiniteFeed({
  videos,
  onLoadMore,
  hasMore,
  isLoading = false,
}: InfiniteFeedProps) {
  const { ref, inView } = useInView({
    threshold: 0,
  })

  React.useEffect(() => {
    if (inView && hasMore && !isLoading) {
      onLoadMore()
    }
  }, [inView, hasMore, isLoading, onLoadMore])

  return (
    <div className="space-y-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
      {(hasMore || isLoading) && (
        <div ref={ref} className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
    </div>
  )
}