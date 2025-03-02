"use client"

import { useVideo } from "@/context/video-context"
import VideoCard from "@/components/video-card"

export default function FavoritesList() {
  const { favorites } = useVideo()

  if (favorites.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">You haven&apos;t added any favorites yet</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-medium mb-4">Your Favorites</h2>
      <div className="space-y-6">
        {favorites.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  )
}

