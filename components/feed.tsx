"use client"

import { useEffect, useState } from "react"
import VideoCard from "@/components/video-card"
import { useVideo } from "@/context/video-context"
import { fetchTrendingVideos } from "@/lib/youtube-api"
import { Loader2 } from "lucide-react"

export default function Feed() {
  const { videos, setVideos, settings } = useVideo()
  const [loading, setLoading] = useState(true)


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
        <div className="space-y-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}

